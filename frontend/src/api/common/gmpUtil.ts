import * as xrpl from "xrpl";
import { ethers } from "ethers";
import {callGmp} from "../backend/gmp";
import {testnet_url, XRPL_MULTISIG_ADDRESS} from "../../const";
async function gmp(user: xrpl.Wallet, contractAddress:string, payloadStr:string,currencyAmount:xrpl.IssuedCurrencyAmount | string, callback: (response: string) => void = console.log): Promise<void> {
    const DESTINATION_ADDRESS = XRPL_MULTISIG_ADDRESS;
    const client = new xrpl.Client(testnet_url);
    await client.connect();
    const payloadHash = ethers.keccak256(payloadStr).replace("0x", "");
    console.log(contractAddress, payloadHash);
    const paymentTx : xrpl.SubmittableTransaction = {
        TransactionType: "Payment",
        Account: user.address,
        Amount: currencyAmount,
        Destination: DESTINATION_ADDRESS,
        Memos: [
            {
                Memo: {
                    MemoData: contractAddress, 
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
    return client.submitAndWait(signed.tx_blob).then(result=>callback(result.result.hash)).finally(() => client.disconnect()).catch((error) => {
        console.error("Error submitting transaction:", error);
    });
}

export async function gmp_and_call_backend(user: xrpl.Wallet, contractAddress:string, payloadStr:string,currencyAmount:xrpl.IssuedCurrencyAmount | string = "0"): Promise<void> {
    const callback = async (response: string) => {
        const maxRetries = 3;
        const sleepTime = 5000;
        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        for (let i = 0; i < maxRetries; i++) {
            const result = await callGmp({payloadString: payloadStr, transactionHash: response});
            if (result.success) {
                return;
            }
            console.log(`GMP call to backend failed: ${result.message}`);
            await sleep(sleepTime);
        }
    }
    return gmp(user, contractAddress, payloadStr, currencyAmount, callback);
}