import { EXPLORER,USDC_issuer,USDC_currency_code,testnet_url,trust_line_limit } from './const.js';
import * as xrpl from 'xrpl';
import fs from 'fs';

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
        console.log(amm_info_result)
        const usd_amount = amm_info_result.result.amm.amount.value
        const xrp_amount_drops = amm_info_result.result.amm.amount2
        const xrp_amount = xrpl.dropsToXrp(xrp_amount_drops)
        console.log(`AMM exists with ${usd_amount} USDC and ${xrp_amount} XRP.`)
    } catch(err) {
            if (err.data.error === 'actNotFound') {
            console.log(`No AMM exists yet for the pair
                        ${USDC_currency_code}.${USDC_issuer.address} / XRP.`)
            } else {
            throw(err)
            }
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
      console.log(ammadd_result)
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

const xrpStrOf = (amount) => xrpl.xrpToDrops(amount).toString();
const usdStrOf = (amount) => amount.toString();
