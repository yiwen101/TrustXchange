// create_wallets.js
import * as xrpl from "xrpl";
import fs from "fs";

async function createWallets() {
    const client = new xrpl.Client("wss://s.devnet.rippletest.net:51233/");
    await client.connect();

    const wallets = [];
    for (let i = 0; i < 3; i++) {
        const wallet = xrpl.Wallet.generate();
        await client.fundWallet(wallet);
        console.log(`Wallet ${i + 1}:`, wallet.address);
        wallets.push(wallet);
    }

    await client.disconnect();
    return wallets;
}

createWallets().then(wallets => {
    // write to file
    fs.writeFileSync("signers.json", JSON.stringify(wallets, null, 2));
    console.log("Wallets created and written to signers.json");
}).catch(console.error);