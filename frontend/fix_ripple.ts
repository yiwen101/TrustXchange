import { Client, Wallet, SubmittableTransaction, AccountSetAsfFlags, } from 'xrpl';

import {  USDC_issuer,testnet_url } from './src/const';
import {walletInfo} from './src/testWallets';

async function must_enable_USDC_rippling_flag(): Promise<void> {
    const client = new Client(testnet_url);
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
    } catch (error) {
        console.error("Error in must_enable_USDC_rippling_flag:", error);
    } finally {
        await client.disconnect();
    }
}

await must_enable_USDC_rippling_flag();