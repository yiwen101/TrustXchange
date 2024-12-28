import { Client, Wallet, dropsToXrp , SubmittableTransaction, AMMInfoResponse, IssuedCurrencyAmount, AMMInfoRequest, AccountSetAsfFlags} from 'xrpl';
import BigNumber from 'bignumber.js';
import { logResponse, usdStrOf, xrpStrOf } from './common';
import { fund_wallet } from './wallet';
import { get_latest_xrp_price } from './xrp_price';
import { mannnet_Bitstamp_usd_address } from '../../const';

const USDC_currency_code = 'USDC';
const USDC_issuer = { address: 'r...', secret: 's...' }; // Replace with actual issuer details

interface AMMInfo {
    usd_amount: number;
    xrp_amount: number;
    full_trading_fee: number;
}

export async function swap_usdc_for_XRP(client: Client, wallet: Wallet, usd_amount: number, intended_xrp_amount: number): Promise<void> {
    try {
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
            Flags: 0x00020000 // immediate or cancel, https://xrpl.org/docs/references/protocol/transactions/types/ammdeposit
        }, { autofill: true, wallet: wallet });
        logResponse(offer_result);
       
    } catch (error) {
        console.error('error:', error);
    }
}

async function _get_amount_for_token(client: Client, token_amount: number, token_is_xrp: boolean, is_intended_token: boolean, info: AMMInfo|null = null): Promise<BigNumber> {
    let amm_info = info;
    if (!amm_info) {
        amm_info = await get_amm_info(client);
    }
    const swap_for_xrp = token_is_xrp === is_intended_token;
    const pool_in_bn = new BigNumber(swap_for_xrp ? amm_info.usd_amount : amm_info.xrp_amount);
    const pool_out_bn = new BigNumber(swap_for_xrp ? amm_info.xrp_amount : amm_info.usd_amount);
    const full_trading_fee = amm_info.full_trading_fee;
    const asset_out_bn = new BigNumber(token_amount);
    const unrounded_amount = is_intended_token ? swapOut(asset_out_bn, pool_in_bn, pool_out_bn, full_trading_fee) : swapIn(asset_out_bn, pool_in_bn, pool_out_bn, full_trading_fee);
    return unrounded_amount;
}

async function _get_amount_can_get_with_token(client: Client, token_amount: number, token_is_xrp: boolean, info: AMMInfo|null = null): Promise<BigNumber> {
    return _get_amount_for_token(client, token_amount, token_is_xrp, false, info);
}

async function _get_amount_needed_for_token(client: Client, token_amount: number, token_is_xrp: boolean, info: AMMInfo|null = null): Promise<BigNumber> {
    return _get_amount_for_token(client, token_amount, token_is_xrp, true, info);
}

export async function get_usd_needed_for_xrp(client: Client, xrp_amount: number, info: AMMInfo|null = null): Promise<BigNumber> {
    return _get_amount_needed_for_token(client, xrp_amount, true, info);
}

export async function get_xrp_needed_for_usd(client: Client, usd_amount: number, info: AMMInfo|null = null): Promise<BigNumber> {
    return _get_amount_needed_for_token(client, usd_amount, false, info);
}

export async function get_usd_can_get_with_xrp(client: Client, xrp_amount: number, info: AMMInfo|null = null): Promise<BigNumber> {
    return _get_amount_can_get_with_token(client, xrp_amount, true, info);
}

export async function get_xrp_can_get_with_usd(client: Client, usd_amount: number, info: AMMInfo|null = null): Promise<BigNumber> {
    return _get_amount_can_get_with_token(client, usd_amount, false, info);
}

export async function create_XRP_USDC_AMM(client: Client, wallet: Wallet): Promise<void> {
    const ss = await client.request({ "command": "server_state" });
    if (!ss.result || !ss.result.state || !ss.result.state.validated_ledger || !ss.result.state.validated_ledger.reserve_inc) {
        throw `Error getting server state: ${ss}`;
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
}

export async function get_amm_info(client: Client, ledger_index:number|"validated"="validated", mainnet=false,): Promise<AMMInfo> {
        const amm_info_request: AMMInfoRequest = {
            command: "amm_info",
            asset: {
                "currency": mainnet? 'USD': USDC_currency_code,
                "issuer": mainnet?mannnet_Bitstamp_usd_address:USDC_issuer.address
            },
            asset2: {
                "currency": "XRP",
            },
            ledger_index: ledger_index
        }; 
        const amm_info_result = await client.request(amm_info_request) as AMMInfoResponse;
        const usd_amount_info = amm_info_result.result.amm.amount as IssuedCurrencyAmount
        const usd_amount = parseInt(usd_amount_info.value);
        const xrp_amount_drops = amm_info_result.result.amm.amount2;
        const xrp_amount = dropsToXrp(xrp_amount_drops as BigNumber.Value);
        const full_trading_fee = amm_info_result.result.amm.trading_fee;
        //const discounted_fee = amm_info_result.result.amm.auction_slot.discounted_fee;
        console.log(`AMM exists with ${usd_amount} USDC and ${xrp_amount} XRP.`);
        return {
            usd_amount: usd_amount,
            xrp_amount: xrp_amount,
            full_trading_fee: full_trading_fee,
        };
}

export async function must_enable_USDC_rippling_flag(client: Client): Promise<void> {
    const issuerAddress = USDC_issuer.address;

    try {
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
        console.error("Error enabling Default Ripple flag:", error);
    }
}

export async function add_usd_to_XRP_USDC_AMM(client: Client, wallet: Wallet, usd_amount: number): Promise<void> {
    const usd_str = usdStrOf(usd_amount);
    console.log(`Adding ${usd_str} USDC to the AMM...`);
    const ammdeposit = {
        "TransactionType": "AMMDeposit",
        "Asset": {
            currency: USDC_currency_code,
            issuer: USDC_issuer.address
        },
        "Asset2": {
            currency: "XRP"
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
}

export async function add_xrp_to_XRP_USDC_AMM(client: Client, wallet: Wallet, xrp_amount: number): Promise<void> {
    const xrp_str = xrpStrOf(xrp_amount);
    console.log(`Adding ${xrp_str} XRP to the AMM...`);
    const ammdeposit = {
        "TransactionType": "AMMDeposit",
        "Asset": {
            currency: USDC_currency_code,
            issuer: USDC_issuer.address
        },
        "Asset2": {
            currency: "XRP"
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
}

export async function top_up_amm(client: Client): Promise<void> {
    try {
        const generation_result = await client.fundWallet();
        const wallet = generation_result.wallet;
        console.log(`created wallet: ${wallet.address}`);
        for (let i = 0; i < 10; i++) {
            await fund_wallet(client, wallet, "1000");
        }
        await get_amm_info(client);
        await add_xrp_to_XRP_USDC_AMM(client, wallet, 10000);
        const info = await get_amm_info(client);
        const amm_xrp_amount = info.xrp_amount;
        const amm_usd_amount = info.usd_amount;
        const price = await get_latest_xrp_price();
        const expected_amm_usd_amount = Math.floor(price * amm_xrp_amount);
        const amm_usd_amount_to_add = Math.max(0, expected_amm_usd_amount - amm_usd_amount);
        if (amm_usd_amount_to_add > 0) {
            await add_usd_to_XRP_USDC_AMM(client, wallet, amm_usd_amount_to_add);
        }
        await get_amm_info(client);
    } catch (err) {
        console.log(err);
    } finally {
        await client.disconnect();
    }
}


function swapOut(asset_out_bn: BigNumber, pool_in_bn: BigNumber, pool_out_bn: BigNumber, trading_fee: number): BigNumber {
    return pool_in_bn.multipliedBy(pool_out_bn)
        .dividedBy(pool_out_bn.minus(asset_out_bn))
        .minus(pool_in_bn)
        .dividedBy(feeMult(trading_fee));
}

function feeDecimal(tFee: number): BigNumber {
    const AUCTION_SLOT_FEE_SCALE_FACTOR = 100000;
    return new BigNumber(tFee).dividedBy(AUCTION_SLOT_FEE_SCALE_FACTOR);
}

function feeMult(tFee: number): BigNumber {
    return new BigNumber(1).minus(feeDecimal(tFee));
}

function swapIn(asset_in_bn: BigNumber, pool_in_bn: BigNumber, pool_out_bn: BigNumber, trading_fee: number): BigNumber {
    const feeMultiplier = feeMult(trading_fee);
    const newPoolIn = pool_in_bn.plus(asset_in_bn.multipliedBy(feeMultiplier));
    const outputAmount = pool_out_bn.minus(
        pool_in_bn.multipliedBy(pool_out_bn).dividedBy(newPoolIn)
    );
    return outputAmount;
}

