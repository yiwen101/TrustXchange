Open Source at Ripple Documentation
Home
Open Source Projects
Search
/

Edit
Call a Smart Contract Function
Attention
Don't use any funds from a mainnet wallet to perform the actions in this tutorial. The steps outlined are for a testnet deployment, so any funds transferred from mainnet may be lost. Additionally:

Gas payments aren't currently supported. You don't need to call AxelarGasService on Ethereum Sepolia to refund our relayer since it's running "pro bono".
The bridge doesn't charge any fees currently.
The IAxelarGateway interface and AxelarExecutable smart contracts used in this tutorial are different from the ones currently deployed by Axelar. Instructions you find elsewhere likely won't be compatible with this testnet deployment.
Only one validator is used to secure this testnet bridge.
Only one relayer is active.
This tutorial describes how to call a function from a smart contract on Ethereum Sepolia from the XRPL Testnet, using General Message Passing (GMP). The following diagram illustrates the process from a high level:

Call a Smart Contract Diagram

Prerequisites

Foundry
XRPL.js Library
Ethers.js Library
An RPC provider, such as Alchemy or Infura, with the SEPOLIA_RPC_URL environment variable set to a working Sepolia RPC URL.
Funded wallets on both chains.
ETH Sepolia Faucet: alchemy.com/faucets/ethereum-sepolia
XRPL Testnet Faucet: faucet.tequ.dev
To perform GMP from XRPL to Ethereum, the Ethereum smart contract that you wish to call needs to implement the AxelarExecutable contract. Please keep in mind that this contract is not the standard AxelarExecutable contract you would find on other Axelar resources.
Steps

Compute the payload (let's call it gmpPayload) that you would like to call your Ethereum Sepolia AxelarExecutable smart contract's _execute function with.

Submit a Payment transaction on XRPL.

If you just want to GMP without transferring tokens, set the Amount to 1 drop of XRP.
Set the destination address in the MemoData field to the address of the Ethereum Sepolia AxelarExecutable smart contract.
Set the payload hash in the MemoData field to keccak256(abi.encode(gmpPayload)). You can use the ethers JS library to compute this hash:


const ethers = require('ethers');
const encodedPayload = ethers.utils.defaultAbiCoder.encode(
    ['string'],
    ['hello, world!']
);
console.log(ethers.utils.keccak256(encodedPayload).slice(2));
Within a few minutes, the relayer should submit validator signatures of the XRPL Testnet deposit transaction to the Ethereum Sepolia AxelarGateway contract, which records the approval of the payload hash and emits a ContractCallApproved event. You can verify that this event was called using the Ethereum Sepolia explorer.

Call the execute function on your AxelarExecutable Ethereum Sepolia smart contract.



AXELAR_EXECUTABLE= # your `AxelarExecutable` contract
COMMAND_ID= # the `commandId` that was emitted in the `ContractCallApproved` event
SOURCE_ADDRESS= # the XRPL address that performed the `Payment` deposit transaction
PAYLOAD= # abi.encode(['string', 'uint256', 'bytes'], [denom, amount, gmpPayload]) # where `denom` is `uxrp` for XRP and `uweth` for WETH
cast send $AXELAR_EXECUTABLE 'function execute(bytes32 commandId, string calldata sourceChain, string calldata sourceAddress, bytes calldata payload)' $COMMAND_ID xrpl $SOURCE_ADDRESS $PAYLOAD --private-key $PRIVATE_KEY --rpc-url $SEPOLIA_RPC_URL
Example GMP Call

We have created and deployed to Ethereum Sepolia an example AxelarExecutable contract called ExecutableSample.

This example calls the ExecutableSample contract from XRPL to update its message state variable to Just transferred XRP to Ethereum!.

Initiate the GMP call by submitting a Payment transaction to the XRPL multisig.



import * as xrpl from "xrpl";

const XRPL_RPC_URL = "wss://s.altnet.rippletest.net:51233";
async function gmp() {
    const client = new xrpl.Client(XRPL_RPC_URL);
    await client.connect();

    // const user = xrpl.Wallet.fromSeed(SEED); // Read XRPL wallet seed from environment or generate and fund new wallet:
    const user = xrpl.Wallet.generate();
    await client.fundWallet(user);

    const paymentTx: xrpl.Transaction = {
        TransactionType: "Payment",
        Account: user.address,
        Amount: "1",
        Destination: "rfEf91bLxrTVC76vw1W3Ur8Jk4Lwujskmb",
        SigningPubKey: "",
        Flags: 0,
        Fee: "30",
        Memos: [
            {
                Memo: {
                    MemoData: "143669292488bd98a0F14F1c73829572f2c25773", // the `ExecutableSample` contract
                    MemoType: Buffer.from("destination_address").toString('hex').toUpperCase(),
                },
            },
            {
                Memo: {
                    MemoData: Buffer.from("ethereum").toString('hex').toUpperCase(),
                    MemoType: Buffer.from("destination_chain").toString('hex').toUpperCase(),
                },
            },
            {
                Memo: {
                    MemoData: "df031b281246235d0e8c8254cd731ed95d2caf4db4da67f41a71567664a1fae8", // keccak256(abi.encode(gmpPayload)), in this example, keccak256(abi.encode(['string'], ['Just transferred XRP to Ethereum!']))
                    MemoType: Buffer.from("payload_hash").toString('hex').toUpperCase(),
                },
            },
        ],
    };

    const signed = user.sign(await client.autofill(paymentTx));
    console.log(signed);
    await client.submitAndWait(signed.tx_blob);
    await client.disconnect();
}

gmp();
Wait for the relayer to call AxelarGateway.execute(). Verify that the ContractCallApproved event was called using the Ethereum Sepolia explorer.

Call the ExecutableSample.execute().



AXELAR_EXECUTABLE=0x143669292488bd98a0F14F1c73829572f2c25773
COMMAND_ID= # the `commandId` that was emitted in the `ContractCallApproved` event
SOURCE_ADDRESS= # the XRPL address of the `user` who performed the `Payment` deposit transaction
# encode(['string', 'uint256', 'bytes'], [denom, amount, encode(['string'], ['Just transferred XRP to Ethereum!'])]) # where `denom` is `uxrp` for XRP and `uweth` for WETH
PAYLOAD=000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000661786c58525000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000214a757374207472616e736665727265642058525020746f20457468657265756d2100000000000000000000000000000000000000000000000000000000000000
cast send $AXELAR_EXECUTABLE 'function execute(bytes32 commandId, string calldata sourceChain, string calldata sourceAddress, bytes calldata payload)' $COMMAND_ID xrpl $SOURCE_ADDRESS $PAYLOAD --private-key $PRIVATE_KEY --rpc-url $SEPOLIA_RPC_URL
AxelarExecutable.message should now be set to 'Just transferred XRP to Ethereum!'.



AXELAR_EXECUTABLE=0x143669292488bd98a0F14F1c73829572f2c25773
cast call $AXELAR_EXECUTABLE 'message()(string)' --rpc-url $SEPOLIA_RPC_URL
# Just transferred XRP to Ethereum!
On this page
Prerequisites
Steps
Example GMP Call
About
Ripple
XRPL Overview
Resources
XRP Ledger Docs
Contribute to the XRP Ledger
© 2013 - 2024 Ripple, All Rights Reserved.