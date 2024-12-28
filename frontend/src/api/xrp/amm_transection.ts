import { Client, Wallet, dropsToXrp, SubmittableTransaction, AMMInfoResponse, IssuedCurrencyAmount, AMMInfoRequest, AccountSetAsfFlags } from 'xrpl';
import BigNumber from 'bignumber.js';
import { logResponse, usdStrOf, xrpStrOf } from './common';
import { fund_wallet } from './wallet';
import { get_latest_xrp_price } from './xrp_price';
import { mannnet_Bitstamp_usd_address, mainnet_url, testnet_url } from '../../const';

const SERVER_URL = testnet_url || 'wss://s.altnet.rippletest.net:51233';

const USDC_currency_code = 'USDC';
const USDC_issuer = { address: 'r...', secret: 's...' }; // Replace with actual issuer details

interface AMMInfo {
    usd_amount: number;
    xrp_amount: number;
    full_trading_fee: number;
}

/**
 * Swaps a specified amount of USDC for XRP.
 * @param wallet - The wallet initiating the swap.
 * @param usd_amount - The amount of USDC to swap.
 * @param intended_xrp_amount - The intended amount of XRP to receive.
 */
export async function swap_usdc_for_XRP(wallet: Wallet, usd_amount: number, intended_xrp_amount: number): Promise<void> {
    const client = new Client(SERVER_URL);
    try {
        await client.connect();
        console.log(`Swapping ${usd_amount} USDC for ${intended_xrp_amount} XRP...`);

        const takerGets = {
            currency: USDC_currency_code,
            issuer: USDC_issuer.address,
            value: usdStrOf(usd_amount),
        };

        const takerPays = xrpStrOf(intended_xrp_amount);

        const offer_result = await client.submitAndWait({
            TransactionType: "OfferCreate",
            Account: wallet.address,
            TakerPays: takerPays,
            TakerGets: takerGets,
            Flags: 0x00020000 // Immediate or Cancel
        }, { autofill: true, wallet: wallet });

        logResponse(offer_result);
    } catch (error) {
        console.error('Error in swap_usdc_for_XRP:', error);
    } finally {
        await client.disconnect();
    }
}

/**
 * Retrieves the amount required or obtainable for a token swap.
 * @param token_amount - The amount of the token.
 * @param token_is_xrp - Indicates if the token is XRP.
 * @param is_intended_token - Indicates if the token is the intended output.
 * @param info - AMM information.
 * @returns The calculated amount as a BigNumber.
 */
async function _get_amount_for_token(token_amount: number, token_is_xrp: boolean, is_intended_token: boolean, info: AMMInfo | null = null): Promise<BigNumber> {
    const client = new Client(SERVER_URL);
    try {
        await client.connect();
        let amm_info = info;
        if (!amm_info) {
            amm_info = await get_amm_info(false);
        }
        const swap_for_xrp = token_is_xrp === is_intended_token;
        const pool_in_bn = new BigNumber(swap_for_xrp ? amm_info.usd_amount : amm_info.xrp_amount);
        const pool_out_bn = new BigNumber(swap_for_xrp ? amm_info.xrp_amount : amm_info.usd_amount);
        const full_trading_fee = amm_info.full_trading_fee;
        const asset_out_bn = new BigNumber(token_amount);
        const unrounded_amount = is_intended_token
            ? swapOut(asset_out_bn, pool_in_bn, pool_out_bn, full_trading_fee)
            : swapIn(asset_out_bn, pool_in_bn, pool_out_bn, full_trading_fee);
        return unrounded_amount;
    } catch (error) {
        console.error('Error in _get_amount_for_token:', error);
        throw error;
    } finally {
        await client.disconnect();
    }
}

/**
 * Calculates the amount that can be obtained with a given token amount.
 * @param token_amount - The amount of the token.
 * @param token_is_xrp - Indicates if the token is XRP.
 * @param info - AMM information.
 * @returns The obtainable amount as a BigNumber.
 */
async function _get_amount_can_get_with_token(token_amount: number, token_is_xrp: boolean, info: AMMInfo | null = null): Promise<BigNumber> {
    return _get_amount_for_token(token_amount, token_is_xrp, false, info);
}

/**
 * Calculates the amount needed for a token swap.
 * @param token_amount - The amount of the token.
 * @param token_is_xrp - Indicates if the token is XRP.
 * @param info - AMM information.
 * @returns The required amount as a BigNumber.
 */
async function _get_amount_needed_for_token(token_amount: number, token_is_xrp: boolean, info: AMMInfo | null = null): Promise<BigNumber> {
    return _get_amount_for_token(token_amount, token_is_xrp, true, info);
}

/**
 * Gets the USD amount needed to obtain a specified XRP amount.
 * @param xrp_amount - The desired XRP amount.
 * @param info - AMM information.
 * @returns The required USD amount as a BigNumber.
 */
export async function get_usd_needed_for_xrp(xrp_amount: number, info: AMMInfo | null = null): Promise<BigNumber> {
    return _get_amount_needed_for_token(xrp_amount, true, info);
}

/**
 * Gets the XRP amount needed to obtain a specified USD amount.
 * @param usd_amount - The desired USD amount.
 * @param info - AMM information.
 * @returns The required XRP amount as a BigNumber.
 */
export async function get_xrp_needed_for_usd(usd_amount: number, info: AMMInfo | null = null): Promise<BigNumber> {
    return _get_amount_needed_for_token(usd_amount, false, info);
}

/**
 * Gets the USD amount obtainable with a specified XRP amount.
 * @param xrp_amount - The XRP amount to swap.
 * @param info - AMM information.
 * @returns The obtainable USD amount as a BigNumber.
 */
export async function get_usd_can_get_with_xrp(xrp_amount: number, info: AMMInfo | null = null): Promise<BigNumber> {
    return _get_amount_can_get_with_token(xrp_amount, true, info);
}

/**
 * Gets the XRP amount obtainable with a specified USD amount.
 * @param usd_amount - The USD amount to swap.
 * @param info - AMM information.
 * @returns The obtainable XRP amount as a BigNumber.
 */
export async function get_xrp_can_get_with_usd(usd_amount: number, info: AMMInfo | null = null): Promise<BigNumber> {
    return _get_amount_can_get_with_token(usd_amount, false, info);
}

/**
 * Creates an XRP-USDC Automated Market Maker (AMM).
 * @param wallet - The wallet creating the AMM.
 */
export async function create_XRP_USDC_AMM(wallet: Wallet): Promise<void> {
    const client = new Client(SERVER_URL);
    try {
        await client.connect();
        const ss = await client.request({ "command": "server_state" });
        if (!ss.result || !ss.result.state || !ss.result.state.validated_ledger || !ss.result.state.validated_ledger.reserve_inc) {
            throw new Error(`Error getting server state: ${JSON.stringify(ss)}`);
        }
        const amm_fee_drops = ss.result.state.validated_ledger.reserve_inc.toString();

        // Define AMM parameters
        const paymentTx = {
            TransactionType: "AMMCreate",
            Account: wallet.address,
            Amount: {
                currency: USDC_currency_code,
                issuer: USDC_issuer.address,
                value: "15"
            },
            Amount2: "100000000",
            TradingFee: 500, // 0.5%
            Fee: amm_fee_drops,
        };

        const prepared = await client.autofill(paymentTx as SubmittableTransaction);
        const signed = wallet.sign(prepared);
        console.log("Submitting transaction...");
        const ammcreate_result = await client.submitAndWait(signed.tx_blob);
        logResponse(ammcreate_result);
    } catch (error) {
        console.error("Error in create_XRP_USDC_AMM:", error);
    } finally {
        await client.disconnect();
    }
}

/**
 * Retrieves AMM information.
 * @param mainnet - Indicates whether to use the mainnet. Defaults to false (testnet).
 * @param ledger_index - The ledger index to query. Defaults to "validated".
 * @returns AMM information.
 */
export async function get_amm_info(mainnet: boolean = false, ledger_index: number | "validated" = "validated"): Promise<AMMInfo> {
    const client = new Client(mainnet ? mainnet_url : SERVER_URL);
    try {
        await client.connect();
        const amm_info_request: AMMInfoRequest = {
            command: "amm_info",
            asset: {
                "currency": mainnet ? 'USD' : USDC_currency_code,
                "issuer": mainnet ? mannnet_Bitstamp_usd_address : USDC_issuer.address
            },
            asset2: {
                "currency": "XRP",
            },
            ledger_index: ledger_index
        };

        const amm_info_result = await client.request(amm_info_request) as AMMInfoResponse;
        const usd_amount_info = amm_info_result.result.amm.amount as IssuedCurrencyAmount;
        const usd_amount = parseInt(usd_amount_info.value);
        const xrp_amount_drops = amm_info_result.result.amm.amount2;
        const xrp_amount = dropsToXrp(xrp_amount_drops as BigNumber.Value);
        const full_trading_fee = amm_info_result.result.amm.trading_fee;
        console.log(`AMM exists with ${usd_amount} USDC and ${xrp_amount} XRP.`);
        return {
            usd_amount: usd_amount,
            xrp_amount: xrp_amount,
            full_trading_fee: full_trading_fee,
        };
    } catch (error) {
        console.error('Error in get_amm_info:', error);
        throw error;
    } finally {
        await client.disconnect();
    }
}

/**
 * Enables the Default Ripple flag for the USDC issuer.
 */
export async function must_enable_USDC_rippling_flag(): Promise<void> {
    const client = new Client(SERVER_URL);
    try {
        await client.connect();
        const issuerAddress = USDC_issuer.address;

        const setFlagTx = {
            TransactionType: "AccountSet",
            Account: issuerAddress,
            SetFlag: AccountSetAsfFlags.asfDefaultRipple,
        };

        const USDC_issuer_wallet = Wallet.fromSeed(USDC_issuer.secret);
        const prepared = await client.autofill(setFlagTx as SubmittableTransaction);
        const signed = USDC_issuer_wallet.sign(prepared);
        const result = await client.submitAndWait(signed.tx_blob);
        logResponse(result);
    } catch (error) {
        console.error("Error in must_enable_USDC_rippling_flag:", error);
    } finally {
        await client.disconnect();
    }
}

/**
 * Adds USD to the XRP-USDC AMM.
 * @param wallet - The wallet adding USD.
 * @param usd_amount - The amount of USD to add.
 */
export async function add_usd_to_XRP_USDC_AMM(wallet: Wallet, usd_amount: number): Promise<void> {
    const client = new Client(SERVER_URL);
    try {
        await client.connect();
        const usd_str = usdStrOf(usd_amount);
        console.log(`Adding ${usd_str} USDC to the AMM...`);

        const ammdeposit = {
            "TransactionType": "AMMDeposit",
            "Asset": {
                currency: USDC_currency_code,
                issuer: USDC_issuer.address
            },
            "Asset2": {
                "currency": "XRP"
            },
            "Account": wallet.address,
            "Amount": {
                currency: USDC_currency_code,
                issuer: USDC_issuer.address,
                value: usd_str
            },
            "Flags": 0x00080000
        };

        const prepared = await client.autofill(ammdeposit as SubmittableTransaction);
        const signed = wallet.sign(prepared);
        console.log("Submitting transaction...");
        await client.submitAndWait(signed.tx_blob);
    } catch (error) {
        console.error("Error in add_usd_to_XRP_USDC_AMM:", error);
    } finally {
        await client.disconnect();
    }
}

/**
 * Adds XRP to the XRP-USDC AMM.
 * @param wallet - The wallet adding XRP.
 * @param xrp_amount - The amount of XRP to add.
 */
export async function add_xrp_to_XRP_USDC_AMM(wallet: Wallet, xrp_amount: number): Promise<void> {
    const client = new Client(SERVER_URL);
    try {
        await client.connect();
        const xrp_str = xrpStrOf(xrp_amount);
        console.log(`Adding ${xrp_str} XRP to the AMM...`);

        const ammdeposit = {
            "TransactionType": "AMMDeposit",
            "Asset": {
                currency: USDC_currency_code,
                issuer: USDC_issuer.address
            },
            "Asset2": {
                "currency": "XRP"
            },
            "Account": wallet.address,
            "Amount": xrp_str,
            "Flags": 0x00080000
        };

        const prepared = await client.autofill(ammdeposit as SubmittableTransaction);
        const signed = wallet.sign(prepared);
        console.log("Submitting transaction...");
        const ammadd_result = await client.submitAndWait(signed.tx_blob);
        console.log(ammadd_result);
    } catch (error) {
        console.error("Error in add_xrp_to_XRP_USDC_AMM:", error);
    } finally {
        await client.disconnect();
    }
}

/**
 * Tops up the AMM with necessary funds.
 */
export async function top_up_amm(): Promise<void> {
    const client = new Client(SERVER_URL);
    try {
        await client.connect();
        const generation_result = await client.fundWallet();
        const wallet = generation_result.wallet;
        console.log(`Created wallet: ${wallet.address}`);

        for (let i = 0; i < 10; i++) {
            await fund_wallet(wallet, "1000");
        }

        await get_amm_info(false);
        await add_xrp_to_XRP_USDC_AMM(wallet, 10000);

        const info = await get_amm_info(false);
        const amm_xrp_amount = info.xrp_amount;
        const amm_usd_amount = info.usd_amount;
        const price = await get_latest_xrp_price();
        const expected_amm_usd_amount = Math.floor(price * amm_xrp_amount);
        const amm_usd_amount_to_add = Math.max(0, expected_amm_usd_amount - amm_usd_amount);

        if (amm_usd_amount_to_add > 0) {
            await add_usd_to_XRP_USDC_AMM(wallet, amm_usd_amount_to_add);
        }

        await get_amm_info(false);
    } catch (error) {
        console.error("Error in top_up_amm:", error);
    } finally {
        await client.disconnect();
    }
}

/**
 * Swaps out a specified asset.
 * @param asset_out_bn - The asset to swap out as a BigNumber.
 * @param pool_in_bn - The input pool amount as a BigNumber.
 * @param pool_out_bn - The output pool amount as a BigNumber.
 * @param trading_fee - The trading fee.
 * @returns The swapped amount as a BigNumber.
 */
function swapOut(asset_out_bn: BigNumber, pool_in_bn: BigNumber, pool_out_bn: BigNumber, trading_fee: number): BigNumber {
    return pool_in_bn.multipliedBy(pool_out_bn)
        .dividedBy(pool_out_bn.minus(asset_out_bn))
        .minus(pool_in_bn)
        .dividedBy(feeMult(trading_fee));
}

/**
 * Converts trading fee to decimal.
 * @param tFee - The trading fee.
 * @returns The trading fee as a BigNumber.
 */
function feeDecimal(tFee: number): BigNumber {
    const AUCTION_SLOT_FEE_SCALE_FACTOR = 100000;
    return new BigNumber(tFee).dividedBy(AUCTION_SLOT_FEE_SCALE_FACTOR);
}

/**
 * Calculates the fee multiplier.
 * @param tFee - The trading fee.
 * @returns The fee multiplier as a BigNumber.
 */
function feeMult(tFee: number): BigNumber {
    return new BigNumber(1).minus(feeDecimal(tFee));
}

/**
 * Swaps in a specified asset.
 * @param asset_in_bn - The asset to swap in as a BigNumber.
 * @param pool_in_bn - The input pool amount as a BigNumber.
 * @param pool_out_bn - The output pool amount as a BigNumber.
 * @param trading_fee - The trading fee.
 * @returns The swapped amount as a BigNumber.
 */
function swapIn(asset_in_bn: BigNumber, pool_in_bn: BigNumber, pool_out_bn: BigNumber, trading_fee: number): BigNumber {
    const feeMultiplier = feeMult(trading_fee);
    const newPoolIn = pool_in_bn.plus(asset_in_bn.multipliedBy(feeMultiplier));
    const outputAmount = pool_out_bn.minus(
        pool_in_bn.multipliedBy(pool_out_bn).dividedBy(newPoolIn)
    );
    return outputAmount;
}