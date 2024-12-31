import {AccountLinesResponse, Client, TxResponse, Wallet, xrpToDrops } from 'xrpl';
import { testnet_url } from '../../const';

export function usdStrOf(amount: number): string {
    return amount.toFixed(2);
}

export function xrpStrOf(amount: number): string {
    return xrpToDrops(amount).toString();
}

export const logResponse = (response: TxResponse) => {
    if (!response.result || !response.result.meta|| typeof response.result.meta != 'object') {
        throw `Error sending transaction: ${response}`;
    }
    if (response.result.meta.TransactionResult === "tesSUCCESS") {
        console.log('Transaction succeeded.');
    } else if (response.result.meta.TransactionResult === "tecKILLED") {
        console.log('Transaction killed.');
    } else {
        console.error('Error sending transaction:', response.result.meta.TransactionResult);
        console.log(`result: ${JSON.stringify(response.result, null, 2)}`);
    }
   
}

export async function get_account_currency_balance(wallet: Wallet, currency_code:string, issuer_address: string): Promise<number> {
    const client = new Client(testnet_url);
    try {
        await client.connect();
        const accountInfo: AccountLinesResponse = await client.request({
            command: 'account_lines',
            account: wallet.address
        });

        const lines = accountInfo.result.lines;
        const Line = lines.find(
            (line) =>
                line.currency === currency_code && line.account === issuer_address
        );

        if (Line) {
            return parseFloat(Line.balance);
        } else {
            return 0;
        }
    } finally {
        await client.disconnect();
    }
}