import * as xrpl from "xrpl";
import { ethers } from "ethers";
import * as p2pUtils from "./p2pPayloadUtil.js"

const XRPL_RPC_URL = "wss://s.devnet.rippletest.net:51233/";
const DESTINATION_ADDRESS = "rfv9EskzSdWEsZsyBrujtidD2qdgiz8v7W";
const AMOUNT = "90000000";

async function gmp(contractAddress, payloadBytes) {
    const client = new xrpl.Client(XRPL_RPC_URL);
    await client.connect();

    // const user = xrpl.Wallet.fromSeed(SEED); // Read XRPL wallet seed from environment or generate and fund new wallet:
    const user = xrpl.Wallet.generate();
    await client.fundWallet(user);
    console.log("User address: ", user.address);
    const payloadHash = ethers.keccak256(payloadBytes).replace(/^0x/, '');
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
}
const {inputData,executeWithTokenParams} = p2pUtils.getP2PBorrowingRequestGMPParams(100);

const payloadByte = executeWithTokenParams.payload;
gmp("",payloadByte);