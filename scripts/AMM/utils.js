import { EXPLORER,USDC_issuer,USDC_currency_code,testnet_url,trust_line_limit,mainnet_url,mannnet_Bitstamp_usd_address } from './const.js';
import * as xrpl from 'xrpl';
import fs from 'fs';
import BigNumber from 'bignumber.js';

const ledger_close_time = (ledger) => new Date((946684800 + ledger.result.ledger.close_time)*1000)
const ledegr_index = (ledger) => ledger.result.ledger.ledger_index
const x_hour_before = (date,x=1) => date - (60 * 60 * 1000) * x
const x_day_before = (date,x=1) => date - (24 * 60 * 60 * 1000) * x
async function get_estimated_ledger(client, date, ledger = undefined) {
    if (!ledger) {
        ledger = await client.request({
            command: 'ledger',
            ledger_index: 'validated',
            include_all_data: false
        });
    }
    const index = ledegr_index(ledger)
    const close_time = ledger_close_time(ledger)
    
    const time_diff = close_time - date
    const time_diff_in_minutes = time_diff / 60000
    const estimated_index = index - Math.floor(time_diff_in_minutes * 19.5)
    const estimated_ledger = await client.request({
        command: 'ledger',
        ledger_index: estimated_index.toString(),
        include_all_data: false
    });
    return estimated_ledger
}

async function get_estimated_ledger_index(client, date, ledger = undefined) {
    const estimated_ledger = await get_estimated_ledger(client, date, ledger)
    return ledegr_index(estimated_ledger)
}

async function get_estimated_ledger_close_time(client, date, ledger = undefined) {
    const estimated_ledger = await get_estimated_ledger(client, date, ledger)
    return ledger_close_time(estimated_ledger)
}

export async function get_latest_xrp_price() {
    const price = await gat_xrp_price_at_ledger("validated")
    console.log(`Latest price: ${price}`)
}

export async function get_xrp_price_hour_ago(x) {
    const date = new Date()
    const hour_ago = x_hour_before(date,x)
    return await gat_xrp_price_at(hour_ago)
}
export async function get_xrp_price_day_ago(x) {
    return await get_xrp_price_hour_ago(24 * x)
}

export async function gat_xrp_price_at(dateTime) {
    const client = new xrpl.Client(mainnet_url);
    try {
        await client.connect();
        const ledger_index = await get_estimated_ledger_index(client,dateTime)
        await client.disconnect();
        const price = await gat_xrp_price_at_ledger(ledger_index)
        const dateTimeFormatted = new Date(dateTime).toISOString()
        console.log(`Price at ${dateTimeFormatted}: ${price}`)
        return price
    } catch(err) {
              console.log(err)
    }
}

export async function gat_xrp_price_at_ledger(ledger_index = "validated") {
    const client = new xrpl.Client(mainnet_url);
    try {
        await client.connect();
        const amm_info_request = {
            "command": "amm_info",
            "asset": {
            "currency": 'USD',
            "issuer": mannnet_Bitstamp_usd_address
            },
            "asset2": {
            "currency": "XRP",
            },
            "ledger_index": ledger_index
        }
        const amm_info_result = await client.request(amm_info_request)
        const usd_amount = amm_info_result.result.amm.amount.value
        const xrp_amount_drops = amm_info_result.result.amm.amount2
        const xrp_amount = xrpl.dropsToXrp(xrp_amount_drops)
        return usd_amount/xrp_amount
    } catch(err) {
              console.log(err)
    } finally {
        await client.disconnect();
    }
}

export async function top_up_amm(client) {
    try {
        const generation_result = await client.fundWallet()
        const wallet = generation_result.wallet
        console.log(`created wallet: ${wallet.address}`)
        for (let i = 0; i < 10; i++) {
            await fund_wallet(client,wallet,"1000");
        }
        await check_AMM_exist(client)
        await add_xrp_to_XRP_USDC_AMM(client,wallet,10000);
        const info = await check_AMM_exist(client)
        const amm_xrp_amount = info.xrp_amount
        const amm_usd_amount = info.usd_amount
        const price = await get_latest_xrp_price()
        const expected_amm_usd_amount = Math.floor(price * amm_xrp_amount)
        const amm_usd_amount_to_add = Math.max(0,expected_amm_usd_amount - amm_usd_amount)
        if (amm_usd_amount_to_add > 0) {
            await add_usd_to_XRP_USDC_AMM(client,wallet,amm_usd_amount_to_add)
        }
        await check_AMM_exist(client)
    } catch(err) {
              console.log(err)
    } finally {
        await client.disconnect();
    }
}

export function load_wallet_from_file(fileName) {
    const data = fs.readFileSync(fileName);
    const obj = JSON.parse(data);
    const wallet = xrpl.Wallet.fromSeed(obj.secret);
    return wallet;
}

export async function create_and_write_wallet(client,fileName) {
  const wallet = xrpl.Wallet.generate();
  console.log(`Generated wallet address: ${wallet.address}`);
  // Create a new wallet
   await client.fundWallet(wallet);
  const account_detail = {
    address: wallet.address,
    secret: wallet.seed,
    publicKey: wallet.publicKey,
    privateKey: wallet.privateKey,
  }
  fs.writeFileSync(fileName, JSON.stringify(account_detail),null,2);
  return wallet;
}

export async function fund_wallet(client,wallet, amountStr = '1000') {
    //const client = new xrpl.Client(testnet_url);
    try {
        // Connect to the Testnet
        //await client.connect();
        console.log(`Funding wallet: ${wallet.address} with ${amountStr} XRP`);
        const { _wallet, balance } = await client.fundWallet(wallet, {amount: amountStr});
        console.log(`Wallet funded. New balance: ${balance}`);
    } catch (error) {
        console.error('error:', error);
    } 
}

export async function establish_usdc_trust_line(client,wallet) {
    //const client = new xrpl.Client(testnet_url);
    try {
        // Connect to the Testnet
        //await client.connect();
        
        const trustSetTx = {
            TransactionType: 'TrustSet',
            Account: wallet.address,
            LimitAmount: {
              currency: USDC_currency_code,
              issuer: USDC_issuer.address,
              value: trust_line_limit
            }
          };
          const preparedTx = await client.autofill(trustSetTx);
            const signedTx = wallet.sign(preparedTx);
            const result = await client.submitAndWait(signedTx.tx_blob);

            if (result.result.meta.TransactionResult === 'tesSUCCESS') {
                console.log('Trust line established successfully.');
            } else {
                console.error('Failed to establish trust line:', result.result.meta.TransactionResult);
            }
    } catch (error) {
        console.error('error:', error);
    }
}

export async function send_usd_to(client,wallet, amountStr = '1000') {
    //const client = new xrpl.Client(testnet_url);
    try {
        // Connect to the Testnet
       // await client.connect();
        
        const issuerWallet = xrpl.Wallet.fromSeed(USDC_issuer.secret);

        const paymentTx = {
            TransactionType: 'Payment',
            Account: issuerWallet.classicAddress,
            Destination: wallet.classicAddress,
            Amount: {
                currency: USDC_currency_code,
                issuer: USDC_issuer.address,
                value: amountStr
            }
        };

        const preparedPaymentTx = await client.autofill(paymentTx);
        const signedPaymentTx = issuerWallet.sign(preparedPaymentTx);
        const paymentResult = await client.submitAndWait(signedPaymentTx.tx_blob);

        if (paymentResult.result.meta.TransactionResult === 'tesSUCCESS') {
            console.log(`Sent ${amountStr} USDC to ${USDC_issuer.address}`);
        }
        else {
            console.error('Failed to send USDC:', paymentResult.result.meta.TransactionResult);
        }
    } catch (error) {
        console.error('error:', error);
    } 
}

export async function log_xrp_balance(client,wallet){
    //const client = new xrpl.Client(testnet_url);
    try {
        // Connect to the Testnet
        //await client.connect();
        const xrpBalance = await client.getXrpBalance(wallet.address);
        console.log('XRP balance of ${wallet.address}:', xrpBalance);
    } catch (error) {
        console.error('error:', error);
    } finally {
        //await client.disconnect();
    }
}

export async function log_usd_balance(client, wallet) {
    //const client = new xrpl.Client(testnet_url);
    try {
        //await client.connect();
        const accountInfo = await client.request({
            command: 'account_lines',
            account: wallet.address
          });
          const lines = accountInfo.result.lines;
            const usdLine = lines.find(
                (line) =>
                line.currency === USDC_currency_code && line.account === USDC_issuer.address
            );
            if (usdLine) {
                console.log('USD balance:', usdLine.balance);
            } else {
                console.log('No USD balance found.');
            }
    } catch (error) {
        console.error('error:', error);
    }
}
  // AMM created: https://testnet.xrpl.org/transactions/D7E42B4B9AA2B409144326299DC47B6B55029B257F7BB916D68CEC42B89370FD
export async function create_XRP_USDC_AMM(client, wallet) {
    const ss = await client.request({"command": "server_state"})
    const amm_fee_drops = ss.result.state.validated_ledger.reserve_inc.toString()
    // Define AMM parameters
     // Create AMM ---------------------------------------------------------------
  // This example assumes that 15 TST ≈ 100 FOO in value.
  const paymentTx = {
    "TransactionType": "AMMCreate",
    "Account": wallet.address,
    "Amount": {
      currency: USDC_currency_code,
      issuer: USDC_issuer.address,
      value: "15"
    },
    "Amount2": "100000000",
    "TradingFee": 500, // 0.5%
    "Fee": amm_fee_drops,
  };
    const prepared = await client.autofill(paymentTx);
    const signed = wallet.sign(prepared);
    console.log("Submitting transaction...");
    const ammcreate_result = await client.submitAndWait(signed.tx_blob);
  // Use fail_hard so you don't waste the tx cost if you mess up
  if (ammcreate_result.result.meta.TransactionResult == "tesSUCCESS") {
    console.log(`AMM created: ${EXPLORER}/transactions/${ammcreate_result.result.hash}`)
  } else {
    throw `Error sending transaction: ${ammcreate_result}`
  }
  
}

  
export async function check_AMM_exist(client) {
    try {
        const amm_info_request = {
            "command": "amm_info",
            "asset": {
            "currency": USDC_currency_code,
            "issuer": USDC_issuer.address
            },
            "asset2": {
            "currency": "XRP",
            },
            "ledger_index": "validated"
        }
        const amm_info_result = await client.request(amm_info_request)
        const usd_amount = amm_info_result.result.amm.amount.value
        const xrp_amount_drops = amm_info_result.result.amm.amount2
        const xrp_amount = xrpl.dropsToXrp(xrp_amount_drops)
        const full_trading_fee = amm_info_result.result.amm.trading_fee
        const discounted_fee = amm_info_result.result.amm.auction_slot.discounted_fee
        console.log(`Trading Fee: ${full_trading_fee/1000}%\nDiscounted Fee: ${discounted_fee/1000}%`)
        console.log(`AMM exists with ${usd_amount} USDC and ${xrp_amount} XRP.`)
        return {
            usd_amount: usd_amount,
            xrp_amount: xrp_amount,
            full_trading_fee: full_trading_fee,
            discounted_fee: discounted_fee
        }
    } catch(err) {
           console.log(err)
    }

}

export async function must_enable_USDC_rippling_flag(client) {
        const issuerAddress = USDC_issuer.address;
    
        try {
                const setFlagTx = {
                    TransactionType: "AccountSet",
                    Account: issuerAddress,
                    SetFlag: xrpl.AccountSetAsfFlags.asfDefaultRipple,
                };
    
                const USDC_issuer_wallet = xrpl.Wallet.fromSeed(USDC_issuer.secret);
                const prepared = await client.autofill(setFlagTx);
                const signed = USDC_issuer_wallet.sign(prepared);
                const result = await client.submitAndWait(signed.tx_blob);
                console.log("Transaction Result:", result);
    
                if (result.result.meta.TransactionResult === "tesSUCCESS") {
                    console.log("Default Ripple flag enabled successfully.");
                } else {
                    console.error("Failed to enable Default Ripple flag:", result.result.meta.TransactionResult);
                }
    
        } catch (error) {
            console.error("Error enabling Default Ripple flag:", error);
        }
}

export async function add_usd_to_XRP_USDC_AMM(client, wallet, usd_amount) {
    const usd_str = usdStrOf(usd_amount)
    console.log(`Adding ${usd_str} USDC to the AMM...`)
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
      }
      const prepared = await client.autofill(ammdeposit);
      const signed = wallet.sign(prepared);
      console.log("Submitting transaction...");
      const ammadd_result = await client.submitAndWait(signed.tx_blob);
      //console.log(ammadd_result)
}

export async function add_xrp_to_XRP_USDC_AMM(client, wallet, xrp_amount) {
    const xrp_str = xrpStrOf(xrp_amount)
    console.log(`Adding ${xrp_str} XRP to the AMM...`)
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
      }
      const prepared = await client.autofill(ammdeposit);
      const signed = wallet.sign(prepared);
      console.log("Submitting transaction...");
      const ammadd_result = await client.submitAndWait(signed.tx_blob);
      console.log(ammadd_result)
}

export async function _get_amount_for_token(client, token_amount, token_is_xrp, is_intended_token,info=null) {
    let amm_info = info
    if (!amm_info) {
        amm_info = await check_AMM_exist(client)
    }
    const swap_for_xrp = token_is_xrp == is_intended_token
    const pool_in_bn = BigNumber(swap_for_xrp ? amm_info.usd_amount: amm_info.xrp_amount)
    const pool_out_bn = BigNumber(swap_for_xrp ? amm_info.xrp_amount: amm_info.usd_amount)
    const full_trading_fee = amm_info.full_trading_fee
    const asset_out_bn = BigNumber(token_amount)
    const unrounded_amount = is_intended_token ? swapOut(asset_out_bn, pool_in_bn, pool_out_bn, full_trading_fee) : swapIn(asset_out_bn, pool_in_bn, pool_out_bn, full_trading_fee)
    return unrounded_amount
}

export async function _get_amount_can_get_with_token(client, token_amount, token_is_xrp, info=null) {
    return _get_amount_for_token(client, token_amount, token_is_xrp, false, info)
}
export async function _get_amount_needed_for_token(client, token_amount, token_is_xrp, info=null) {
    return _get_amount_for_token(client, token_amount, token_is_xrp, true, info)
}
export async function get_usd_needed_for_xrp(client, xrp_amount, info=null) {
    return _get_amount_needed_for_token(client,xrp_amount, true, info)
}
export async function get_xrp_needed_for_usd(client, usd_amount, info=null) {
    return _get_amount_needed_for_token(client, usd_amount, false, info)
}
export async function get_usd_can_get_with_xrp(client, xrp_amount, info=null) {
    return _get_amount_can_get_with_token(client, xrp_amount, true, info)
}
export async function get_xrp_can_get_with_usd(client, usd_amount, info=null) {
    return _get_amount_can_get_with_token(client, usd_amount, false, info)
}

export async function swap_usdc_for_XRP(client, wallet, usd_amount, intended_xrp_amount) {
    try {
        console.log(`Swapping ${usd_amount} USDC for ${intended_xrp_amount} XRP...`)    
        const takerGets = {
            currency: USDC_currency_code,
            issuer: USDC_issuer.address,
            value: usdStrOf(usd_amount),
        };

        const takerPays = xrpStrOf(intended_xrp_amount)

        const offer_result = await client.submitAndWait({
            TransactionType: "OfferCreate",
            Account: wallet.address,
            TakerPays: takerPays,
            TakerGets: takerGets,
            Flags: 0x00020000 // immediate or cancel, https://xrpl.org/docs/references/protocol/transactions/types/ammdeposit
        }, { autofill: true, wallet: wallet });
        
        if (offer_result.result.meta.TransactionResult === "tesSUCCESS") {
            console.log('Transaction succeeded.');
        } else if (offer_result.result.meta.TransactionResult === "tecKILLED") {
            console.log('Transaction killed.');
        }else {
            console.error('Error sending transaction:', offer_result.result.meta.TransactionResult);
            console.log(`result: ${JSON.stringify(offer_result.result, null, 2)}`);
        }
    } catch (error) {
        console.error('error:', error);
    }
}

const xrpStrOf = (amount) => xrpl.xrpToDrops(amount).toString();
const usdStrOf = (amount) => amount.toString();



// credit: https://github.com/XRPLF/xrpl-dev-portal/tree/master

/* Implement the AMM SwapOut formula, as defined in XLS-30 section 2.4 AMM 
 * Swap, formula 10. The asset weights WA/WB are currently always 1/1 so 
 * they're canceled out.
 * C++ source: https://github.com/XRPLF/rippled/blob/2d1854f354ff8bb2b5671fd51252c5acd837c433/src/ripple/app/misc/AMMHelpers.h#L253-L258
 * @param asset_out_bn BigNumber - The target amount to receive from the AMM.
 * @param pool_in_bn BigNumber - The amount of the input asset in the AMM's 
 *                               pool before the swap.
 * @param pool_out_bn BigNumber - The amount of the output asset in the AMM's
 *                                pool before the swap.
 * @param trading_fee int - The trading fee as an integer {0, 1000} where 1000 
 *                          represents a 1% fee.
 * @returns BigNumber - The amount of the input asset that must be swapped in 
 *                      to receive the target output amount. Unrounded, because
 *                      the number of decimals depends on if this is drops of 
 *                      XRP or a decimal amount of a token; since this is a
 *                      theoretical input to the pool, it should be rounded 
 *                      up (ceiling) to preserve the pool's constant product.
 */
function swapOut(asset_out_bn, pool_in_bn, pool_out_bn, trading_fee) {
    return ( ( pool_in_bn.multipliedBy(pool_out_bn) ).dividedBy(
                pool_out_bn.minus(asset_out_bn)
             ).minus(pool_in_bn)
           ).dividedBy(feeMult(trading_fee))
}

function feeDecimal(tFee) {
    const AUCTION_SLOT_FEE_SCALE_FACTOR = 100000
    return BigNumber(tFee).dividedBy(AUCTION_SLOT_FEE_SCALE_FACTOR)
}

function feeMult(tFee) {
    return BigNumber(1).minus( feeDecimal(tFee) )
}

/**
 * Implement the AMM SwapIn formula.
 * @param asset_in_bn BigNumber - The amount of the input asset to swap into the AMM.
 * @param pool_in_bn BigNumber - The amount of the input asset in the AMM's pool before the swap.
 * @param pool_out_bn BigNumber - The amount of the output asset in the AMM's pool before the swap.
 * @param trading_fee int - The trading fee as an integer {0, 1000} where 1000 represents a 1% fee.
 * @returns BigNumber - The amount of the output asset that will be received from the swap.
 */
function swapIn(asset_in_bn, pool_in_bn, pool_out_bn, trading_fee) {
    const feeMultiplier = feeMult(trading_fee);
    const newPoolIn = pool_in_bn.plus(asset_in_bn.multipliedBy(feeMultiplier));
    const outputAmount = pool_out_bn.minus(
        pool_in_bn.multipliedBy(pool_out_bn).dividedBy(newPoolIn)
    );
    return outputAmount;
}