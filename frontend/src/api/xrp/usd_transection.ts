import { Client, Wallet, SubmittableTransaction } from 'xrpl';
import { get_account_currency_balance, logResponse } from './common';
import { USDC_currency_code,USDC_issuer,trust_line_limit } from '../../const';
// Ensure these constants are defined elsewhere in your project
const testnet_url = 'wss://s.altnet.rippletest.net:51233';

/**
 * Logs the USD balance for the given wallet.
 * @param wallet - The wallet whose USD balance is to be logged.
 */
export async function log_usd_balance(wallet: Wallet): Promise<void> {
    try {
        const balance = await get_account_currency_balance(wallet, USDC_currency_code, USDC_issuer.address);

        if (balance) {
            console.log('USD balance:', balance);
        } else {
            console.log('No USD balance found.');
        }
    } catch (error) {
        console.error('Error in log_usd_balance:', error);
    }
}

/**
 * Sends USD to the specified wallet.
 * @param wallet - The wallet to send USD to.
 * @param amountStr - The amount of USDC to send as a string. Defaults to '1000'.
 */
export async function send_usd_to(wallet: Wallet, amountStr: string = '1000'): Promise<void> {
    const client = new Client(testnet_url);
    try {
        await client.connect();
        const issuerWallet: Wallet = Wallet.fromSeed(USDC_issuer.secret);

        const paymentTx: {
            TransactionType: string;
            Account: string;
            Destination: string;
            Amount: {
                currency: string;
                issuer: string;
                value: string;
            };
        } = {
            TransactionType: 'Payment',
            Account: issuerWallet.classicAddress,
            Destination: wallet.classicAddress,
            Amount: {
                currency: USDC_currency_code,
                issuer: USDC_issuer.address,
                value: amountStr
            }
        };

        const preparedPaymentTx = await client.autofill(paymentTx as SubmittableTransaction);
        const signedPaymentTx = issuerWallet.sign(preparedPaymentTx);
        const paymentResult = await client.submitAndWait(signedPaymentTx.tx_blob);
        logResponse(paymentResult);
    } catch (error) {
        console.error('Error in send_usd_to:', error);
    } finally {
        await client.disconnect();
    }
}

/**
 * Establishes a USDC trust line for the given wallet.
 * @param wallet - The wallet for which to establish the trust line.
 */
export async function establish_usdc_trust_line(wallet: Wallet): Promise<void> {
    const client = new Client(testnet_url);
    try {
        await client.connect();
        const trustSetTx: {
            TransactionType: string;
            Account: string;
            LimitAmount: {
                currency: string;
                issuer: string;
                value: string;
            };
        } = {
            TransactionType: 'TrustSet',
            Account: wallet.address,
            LimitAmount: {
                currency: USDC_currency_code,
                issuer: USDC_issuer.address,
                value: trust_line_limit
            }
        };

        const preparedTx = await client.autofill(trustSetTx as SubmittableTransaction);
        const signedTx = wallet.sign(preparedTx);
        const result = await client.submitAndWait(signedTx.tx_blob);
        logResponse(result);
    } catch (error) {
        console.error('Error in establish_usdc_trust_line:', error);
    } finally {
        await client.disconnect();
    }
}