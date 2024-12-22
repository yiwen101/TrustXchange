const xrpl = require('xrpl');
const fs = require('fs');

async function createTestAccounts() {
  // Define the Testnet server URL
  const serverUrl = 'wss://s.altnet.rippletest.net:51233';

  // Create a new client instance
  const client = new xrpl.Client(serverUrl);

  try {
    // Connect to the Testnet
    await client.connect();
    console.log('Connected to XRPL Testnet');

    // Array to hold the new accounts
    const newAccounts = [];

    // Generate 10 new accounts
    for (let i = 0; i < 17; i++) {
      const newAccount = await client.fundWallet();
      newAccounts.push({
        address: newAccount.wallet.classicAddress,
        secret: newAccount.wallet.seed,
        publicKey: newAccount.wallet.publicKey,
        privateKey: newAccount.wallet.privateKey,
        balance: newAccount.balance
      });
      console.log(`New Account ${i + 1}:`, newAccount);
    }

    // Output the new accounts
    console.log('Generated Accounts:', newAccounts);

    // Write the new accounts to a JSON file
    fs.writeFileSync('test_accounts.json', JSON.stringify(newAccounts, null, 2));
    console.log('Accounts saved to test_accounts.json');

  } catch (error) {
    console.error('Failed to create test accounts:', error);
  } finally {
    // Disconnect from the Testnet
    await client.disconnect();
    console.log('Disconnected from XRPL Testnet');
  }
}

// Run the function to create test accounts
createTestAccounts();