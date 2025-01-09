import * as xrpl from "xrpl";
import { ethers } from "ethers";
import {callGmp} from "../backend/gmp";
import {testnet_url, USDC_issuer} from "../../const";
async function gmp(user: xrpl.Wallet, contractAddress:string, payloadStr:string,currencyAmount:xrpl.IssuedCurrencyAmount | string): Promise<string> {
    const DESTINATION_ADDRESS = USDC_issuer.address;
    const client = new xrpl.Client(testnet_url);
    try{
    await client.connect();
    const payloadHash = ethers.keccak256(payloadStr).replace("0x", "");
    console.log(contractAddress, payloadHash);
    console.log("payload string is", payloadStr);
    const paymentTx : xrpl.SubmittableTransaction = {
        TransactionType: "Payment",
        Account: user.address,
        Amount: currencyAmount,
        Destination: DESTINATION_ADDRESS,
        Memos: [
            {
                Memo: {
                    MemoData: contractAddress.replace("0x", ""), 
                    MemoType: "64657374696E6174696F6E5F61646472657373", // hex("destination_address")
                },
            },
            {
                Memo: {
                    MemoData: "7872706C2D65766D2D73696465636861696E", // hex("xrpl-evm-sidechain")
                    MemoType: "64657374696E6174696F6E5F636861696E", // hex("destination_chain")
                },
            },
            {
                Memo: {
                    MemoData: payloadHash,
                    MemoType: "7061796C6F61645F68617368", // hex("payload_hash")
                },
            },
        ],
    };

    const signed = user.sign(await client.autofill(paymentTx));
    console.log("Submitting transaction...");
    const result = await client.submitAndWait(signed.tx_blob)
    console.log("Transaction submitted. Result:", result);
    return result.result.hash;
    } finally {
        await client.disconnect();
    }
}

export async function gmp_and_call_backend(
    user: xrpl.Wallet, 
    contractAddress:string,
    payloadStr:string,
    currencyAmount:xrpl.IssuedCurrencyAmount | string = "0",
    beforeCallBackend: undefined | ((response: string) => void) = undefined,
    afterCallBackend: undefined | ((response: string) => void) = undefined,
): Promise<void> {

    const callBackend = async (response: string) => {
        if (beforeCallBackend) {
            beforeCallBackend(response);
        }
        const maxRetries = 10;
        const oneSecond = 1000;
        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        for (let i = 0; i < maxRetries; i++) {
            await sleep(oneSecond);
            const result = await callGmp({payloadString: payloadStr, transactionHash: response});
            if (result.success) {
                await sleep(oneSecond*5);
                if (afterCallBackend) {
                    afterCallBackend(result.message);
                }
                return;
            }
            console.log(`GMP call to backend failed: ${result.message}`); 
        }
    }
    return gmp(user, contractAddress, payloadStr, currencyAmount).then(hash => callBackend(hash));
}