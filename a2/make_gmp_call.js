import * as xrpl from "xrpl";
import { ethers } from "ethers";

const XRPL_RPC_URL = "wss://s.altnet.rippletest.net:51233";
async function gmp() {
    const client = new xrpl.Client(XRPL_RPC_URL);
    await client.connect();

    // const user = xrpl.Wallet.fromSeed(SEED); // Read XRPL wallet seed from environment or generate and fund new wallet:
    const user = xrpl.Wallet.generate();
    await client.fundWallet(user);
    console.log("User address: ", user.address);
    const abiCoder = new ethers.utils.AbiCoder();
    const encodedPayload = abiCoder.encode(['string'], ['Hello World by Yiwen']); // Replace with your message
    const payloadHash = ethers.utils.keccak256(encodedPayload).replace(/^0x/, '');

    const paymentTx = {
        TransactionType: "Payment",
        Account: user.address,
        Amount: "1000000", // 1 XRP in drops
        Destination: "rfEf91bLxrTVC76vw1W3Ur8Jk4Lwujskmb",
        SigningPubKey: "",
        Flags: 0,
        Fee: "30",
        Memos: [
            {
                Memo: {
                    MemoData: "68246D1C63f1182FCe9694c36bcc678494E3fd46", 
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
    console.log(result);
    await client.disconnect();
}

gmp();