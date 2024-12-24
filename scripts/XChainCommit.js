import * as xrpl from "xrpl";

const XRPL_RPC_URL = "wss://s.devnet.rippletest.net:51233/";
const OtherChainDestination = "rGo4HdEE3wXToTqcEGxCAeaFYfqiRGdWSX";
const bridge_address= "rnJnBjnpTZPmUyZsW2QSenZhEwPzEuRSxz";
const AMOUNT = "10000000"; // 10 XRP in drops (1 XRP = 1,000,000 drops)

async function XChainCommit() {
    const client = new xrpl.Client(XRPL_RPC_URL);
    console.log("Connecting to XRPL...");
    await client.connect();

    // Replace with your wallet seed
    const wallet = xrpl.Wallet.generate();
    console.log("funding wallet...");
    await client.fundWallet(wallet);
    const createClaimIDTx = {
        TransactionType: "XChainCreateClaimID",
        Account: wallet.address,
        OtherChainSource: OtherChainSource,
        SignatureReward: SignatureReward,
        XChainBridge: {
            LockingChainDoor: bridge_address,
            LockingChainIssue: {
                currency: "XRP"
            },
            IssuingChainDoor: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
            IssuingChainIssue: {
                currency: "XRP"
            }
        }
    };
    const paymentTx = {
        TransactionType: "XChainCommit",
        Account: wallet.address,
        Amount: AMOUNT,
        Destination: bridge_address,
        OtherChainDestination: OtherChainDestination,
        XChainBridge: {
            IssuingChainDoor: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
            IssuingChainIssue: {
            currency: "XRP"
            },
            LockingChainDoor: "rnJnBjnpTZPmUyZsW2QSenZhEwPzEuRSxz",
            LockingChainIssue: {
            currency: "XRP"
            }
            }
        XChainClaimID:
            
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

XChainCommit().catch(console.error);