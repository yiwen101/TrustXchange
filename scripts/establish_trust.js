const xrpl = require('xrpl');
const { issuer, test_accounts, issue_limit,currencyCode } = require('./const.js');

async function establishTrustLines() {
    // Define the Testnet server URL
    const serverUrl = 'wss://s.altnet.rippletest.net:51233';

    // Create a new client instance
    const client = new xrpl.Client(serverUrl);

    try {
        // Connect to the Testnet
        await client.connect();
        console.log('Connected to XRPL Testnet');

        // Establish trust lines
        for (const user of test_accounts) {
            const wallet = xrpl.Wallet.fromSeed(user.secret);

            const trustSetTx = {
                TransactionType: 'TrustSet',
                Account: wallet.classicAddress,
                LimitAmount: {
                    currency: currencyCode,
                    issuer: issuer.address,
                    value: (issue_limit + 1).toString()
                }
            };

            const preparedTx = await client.autofill(trustSetTx);
            const signedTx = wallet.sign(preparedTx);
            const result = await client.submitAndWait(signedTx.tx_blob);

            console.log(`Trust line established for ${user.address}:`, result);
        }

    } catch (error) {
        console.error('Failed to establish trust lines:', error);
    } finally {
        // Disconnect from the Testnet
        await client.disconnect();
        console.log('Disconnected from XRPL Testnet');
    }
}

establishTrustLines();
