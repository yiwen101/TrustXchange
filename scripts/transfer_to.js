import * as xrpl from "xrpl";

const XRPL_RPC_URL = "wss://s.devnet.rippletest.net:51233/";
const DESTINATION_ADDRESS = "rfv9EskzSdWEsZsyBrujtidD2qdgiz8v7W";
const AMOUNT = "10000000"; // 10 XRP in drops (1 XRP = 1,000,000 drops)

async function transferTokens() {
    const client = new xrpl.Client(XRPL_RPC_URL);
    console.log("Connecting to XRPL...");
    await client.connect();

    // Replace with your wallet seed
    const wallet = xrpl.Wallet.generate();
    console.log("funding wallet...");
    await client.fundWallet(wallet);

    const paymentTx = {
        TransactionType: "Payment",
        Account: wallet.address,
        Amount: AMOUNT,
        Destination: DESTINATION_ADDRESS,
    };

    try {
        console.log("Preparing transaction...");
        const prepared = await client.autofill(paymentTx);
        const signed = wallet.sign(prepared);
        console.log("Submitting transaction...");
        const result = await client.submitAndWait(signed.tx_blob);
        console.log("Transaction Result:", result);
    } catch (error) {
        console.error("Error submitting transaction:", error);
    } finally {
        await client.disconnect();
    }
}

transferTokens().catch(console.error);