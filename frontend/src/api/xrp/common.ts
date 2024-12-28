import {TxResponse, xrpToDrops } from 'xrpl';

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

