const xrpl = require('xrpl');
const { issuer, test_accounts, currencyCode } = require('./const.js');

async function checkTokenBalances() {
    // Define the Testnet server URL
    const serverUrl = 'wss://s.altnet.rippletest.net:51233';

    // Create a new client instance
    const client = new xrpl.Client(serverUrl);

    try {
        // Connect to the Testnet
        await client.connect();
        console.log('Connected to XRPL Testnet');

        // Check token balances for each test account
        for (const user of test_accounts) {
            const response = await client.request({
                command: 'account_lines',
                account: user.address,
                ledger_index: 'validated'
            });

            const lines = response.result.lines;
            console.log(lines)
        }

    } catch (error) {
        console.error('Failed to check token balances:', error);
    } finally {
        // Disconnect from the Testnet
        await client.disconnect();
        console.log('Disconnected from XRPL Testnet');
    }
}

checkTokenBalances();