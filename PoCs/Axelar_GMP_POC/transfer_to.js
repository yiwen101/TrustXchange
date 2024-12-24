// transfer_to.js
import * as xrpl from "xrpl";

const XRPL_RPC_URL = "wss://s.devnet.rippletest.net:51233/";
const DESTINATION_ADDRESS = "rfv9EskzSdWEsZsyBrujtidD2qdgiz8v7W";
const AMOUNT = "10000000"; // 10 XRP in drops (1 XRP = 1,000,000 drops)

async function transferTokens() {
    const client = new xrpl.Client(XRPL_RPC_URL);
    console.log("Connecting to XRPL...");
    await client.connect();

    // Generate a new wallet
    const wallet = xrpl.Wallet.generate();
    console.log("Generated new wallet:", wallet.address);

    // Fund the wallet
    console.log("Funding wallet...");
    await client.fundWallet(wallet);
    console.log("Wallet funded.");

    // Optional: Wait for a few seconds to ensure the funding transaction is processed
    await new Promise(resolve => setTimeout(resolve, 2000));

    const paymentTx = {
        TransactionType: "Payment",
        Account: wallet.address,
        Amount: AMOUNT,
        Destination: DESTINATION_ADDRESS,
        // Removed Fee and Flags to let autofill handle them
    };

    try {
        console.log("Preparing transaction...");
        const prepared = await client.autofill(paymentTx);
        console.log("Prepared Transaction:", prepared);

        const signed = wallet.sign(prepared);
        console.log("Signed Transaction:", signed);

        console.log("Submitting transaction...");
        const result = await client.submitAndWait(signed.tx_blob);
        console.log("Transaction Result:", result);
    } catch (error) {
        console.error("Error submitting transaction:", error);
    } finally {
        await client.disconnect();
        console.log("Disconnected from XRPL.");
    }
}

transferTokens().catch(console.error);