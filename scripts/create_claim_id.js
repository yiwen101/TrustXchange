// Import ethers.js library and dotenv for environment variables
const { ethers } = require('ethers');
require('dotenv').config();

// Load private key and RPC URL from environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL || 'https://rpc-evm-sidechain.xrpl.org'; // Default RPC URL

// Initialize provider for XRPL EVM side chain using HTTPS RPC endpoint
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

// Create wallet instance using your private key
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Define smart contract address
const contractAddress = '0xc2a29b0cD12d146cEb42C3DABF6E4a2a39a07b86';

// Define the ABI for the createClaimId method
const contractABI = [
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "lockingChainDoor",
                        "type": "address"
                    },
                    {
                        "components": [
                            {
                                "internalType": "address",
                                "name": "issuer",
                                "type": "address"
                            },
                            {
                                "internalType": "string",
                                "name": "currency",
                                "type": "string"
                            }
                        ],
                        "internalType": "struct XChainTypes.BridgeChainIssue",
                        "name": "lockingChainIssue",
                        "type": "tuple"
                    },
                    {
                        "internalType": "address",
                        "name": "issuingChainDoor",
                        "type": "address"
                    },
                    {
                        "components": [
                            {
                                "internalType": "address",
                                "name": "issuer",
                                "type": "address"
                            },
                            {
                                "internalType": "string",
                                "name": "currency",
                                "type": "string"
                            }
                        ],
                        "internalType": "struct XChainTypes.BridgeChainIssue",
                        "name": "issuingChainIssue",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct XChainTypes.BridgeConfig",
                "name": "bridgeConfig",
                "type": "tuple"
            },
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            }
        ],
        "name": "createClaimId",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    }
];

// Create contract instance
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// Function to create Claim ID
async function createClaimID() {
    try {
        // Define bridgeConfig as per the ABI with correct key casing and required fields
        const bridgeConfig = {
            LockingChainDoor: "rnJnBjnpTZPmUyZsW2QSenZhEwPzEuRSxz",
            LockingChainIssue: {
                currency: "XRP"
            },
            IssuingChainDoor: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
            IssuingChainIssue: {
                currency: "XRP"
            }
        };

        // Define sender address
        const sender = '0x6Ac15576b50aa305739b77A54C59E31ee420922A'; // Replace with your sender address

        // Define the amount of native XRP to send (in wei)
        const sendNativeXRP = ethers.utils.parseUnits('100', 18); // Adjust the amount as needed

        // Optional: Define gas limits and gas prices if necessary
        const txOptions = {
            value: sendNativeXRP,
            gasLimit: 200000, // Adjust based on contract requirements
            gasPrice: ethers.utils.parseUnits('10', 'gwei') // Adjust based on network conditions
        };

        // Log the bridgeConfig for debugging
        console.log('Bridge Config:', bridgeConfig);
        console.log('Sender:', sender);
        console.log('Send Native XRP (wei):', sendNativeXRP.toString());

        // Call the createClaimId function with transaction options
        const tx = await contract.createClaimId(bridgeConfig, sender, txOptions);
        console.log('Transaction sent:', tx.hash);

        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log('Transaction confirmed with', receipt.confirmations, 'confirmations.');
    } catch (error) {
        console.error('Error calling createClaimId:', error);
    }
}

// Execute the function
createClaimID();