const xrpl = require('xrpl');
const { issuer, test_accounts, issue_limit, currencyCode } = require('./const.js');

async function issueTokens() {
    // Define the Testnet server URL
    const serverUrl = 'wss://s.altnet.rippletest.net:51233';

    // Create a new client instance
    const client = new xrpl.Client(serverUrl);

    try {
        // Connect to the Testnet
        await client.connect();
        console.log('Connected to XRPL Testnet');

        // Issue tokens
        const issuerWallet = xrpl.Wallet.fromSeed(issuer.secret);

        for (const user of test_accounts) {
            const paymentTx = {
                TransactionType: 'Payment',
                Account: issuerWallet.classicAddress,
                Destination: user.address,
                Amount: {
                    currency: currencyCode, // Custom currency code
                    issuer: issuer.address,
                    value: (issue_limit/50).toString() // Amount of USDC to issue
                }
            };

            const preparedTx = await client.autofill(paymentTx);
            const signedTx = issuerWallet.sign(preparedTx);
            const result = await client.submitAndWait(signedTx.tx_blob);

            console.log(`Issued USDC to ${user.address}:`, result);
        }

    } catch (error) {
        console.error('Failed to issue tokens:', error);
    } finally {
        // Disconnect from the Testnet
        await client.disconnect();
        console.log('Disconnected from XRPL Testnet');
    }
}

issueTokens();