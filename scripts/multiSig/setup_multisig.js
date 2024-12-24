// setup_multisig.js
import * as xrpl from "xrpl";
import {signerInfo,multisigWalletInfo} from "./signer_info.js";

async function setupMultisig(multisigWalletInfo, signers) {
    const client = new xrpl.Client("wss://s.devnet.rippletest.net:51233/");
    await client.connect();

    const signerEntries = signers.map(signer => ({
        SignerEntry: {
            Account: signer.classicAddress,
            SignerWeight: 1
        }
    }));

    const setSignerListTx = {
        TransactionType: "SignerListSet",
        Account: multisigWalletInfo.classicAddress,
        SignerQuorum: 2,
        SignerEntries: signerEntries
    };
    console.log("SignerListSet Transaction:", setSignerListTx);
    const multisigWallet = xrpl.Wallet.fromSeed(multisigWalletInfo.seed);
    const prepared = await client.autofill(setSignerListTx);
    console.log("Prepared Transaction:", prepared);
    const signed = multisigWallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);
    console.log("SignerListSet Result:", result);
    
    await client.disconnect();
}

await setupMultisig(multisigWalletInfo, signerInfo);
