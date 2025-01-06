import * as xrpl from "xrpl";
import { ethers } from "ethers";
import * as p2pUtils from "./p2pPayloadUtil.js"

const XRPL_RPC_URL = "wss://s.devnet.rippletest.net:51233/";
const DESTINATION_ADDRESS = "rfv9EskzSdWEsZsyBrujtidD2qdgiz8v7W";
const AMOUNT = "90000000";

async function gmp(contractAddress, payloadStr) {
    const client = new xrpl.Client(XRPL_RPC_URL);
    await client.connect();

    // const user = xrpl.Wallet.fromSeed(SEED); // Read XRPL wallet seed from environment or generate and fund new wallet:
    const user = xrpl.Wallet.generate();
    await client.fundWallet(user);
    console.log("User address: ", user.address);
    const payloadHash = ethers.keccak256(payloadStr).replace("0x", "");
    const paymentTx = {
        TransactionType: "Payment",
        Account: user.address,
        Amount: AMOUNT,
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
    console.log(signed);
    const result = await client.submitAndWait(signed.tx_blob);
    console.log("hash" + result.result.hash);
    await client.disconnect();
    return result.result.hash;
}
const {inputData,executeWithTokenParams} = p2pUtils.getP2PBorrowingRequestGMPParams(203);

const payloadStr = executeWithTokenParams.payload;
// spring-boot
const backendApi = "http://localhost:8080/api/gmp-info/check";
/*
@Getter
@Setter
class CheckGmpInfoRequest {
    private String payloadString;
    private String transactionHash;
}
*/
//const hash =  await gmp("",payloadStr);
// sleep for 10 seconds
await new Promise(resolve => setTimeout(resolve, 10000));
const response = await fetch(backendApi, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        payloadString: payloadStr,
        transactionHash: 'CFC45CAF98E171427672F271FF56D871F1483642649DA77A64C7C4AB1FB54677',
    }),
});
console.log(response);
/*
class CheckGmpInfoResponse {
    public String message;

    public CheckGmpInfoResponse(String message) {
        this.message = message;
    }
}
*/
const data = await response.json();
console.log(data.message);