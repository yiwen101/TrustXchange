import { USDC_issuer,USDC_currency_code,testnet_url,trust_line_limit } from './const.js';
import * as xrpl from 'xrpl';
import fs from 'fs';

export function load_wallet_from_file(fileName) {
    const data = fs.readFileSync(fileName);
    const obj = JSON.parse(data);
    const wallet = xrpl.Wallet.fromSeed(obj.secret);
    return wallet;
}

export async function create_and_write_wallet(fileName) {
    const client = new xrpl.Client(testnet_url);
  await client.connect();
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
  await client.disconnect();
  return wallet;
}

export async function fund_wallet(wallet, amountStr = '1000') {
    const client = new xrpl.Client(testnet_url);
    try {
        // Connect to the Testnet
        await client.connect();
        console.log(`Funding wallet: ${wallet.address} with ${amountStr} XRP`);
        const { _wallet, balance } = await client.fundWallet(wallet, {amount: amountStr});
        console.log(`Wallet funded. New balance: ${balance}`);
    } catch (error) {
        console.error('error:', error);
    } finally {
        await client.disconnect();
    }
}

export async function establish_usdc_trust_line(wallet) {
    const client = new xrpl.Client(testnet_url);
    try {
        // Connect to the Testnet
        await client.connect();
        
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
    } finally {
        await client.disconnect();
    }
}

export async function send_usd_to(wallet, amountStr = '1000') {
    const client = new xrpl.Client(testnet_url);
    try {
        // Connect to the Testnet
        await client.connect();
        
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
    } finally {
        await client.disconnect();
    }
}

export async function log_xrp_balance(wallet){
    const client = new xrpl.Client(testnet_url);
    try {
        // Connect to the Testnet
        await client.connect();
        const xrpBalance = await client.getXrpBalance(wallet.address);
        console.log('XRP balance of ${wallet.address}:', xrpBalance);
    } catch (error) {
        console.error('error:', error);
    } finally {
        await client.disconnect();
    }
}

export async function log_usd_balance(wallet) {
    const client = new xrpl.Client(testnet_url);
    try {
        await client.connect();
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
    } finally {
        await client.disconnect();
    }
}
