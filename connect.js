const xrpl = require('xrpl');

async function connectToTestnet() {
  // Define the Testnet server URL
  const serverUrl = 'wss://s.altnet.rippletest.net:51233';

  // Create a new client instance
  const client = new xrpl.Client(serverUrl);

  try {
    // Connect to the Testnet
    await client.connect();
    console.log('Connected to XRPL Testnet');

    // Perform any additional setup or transactions here

  } catch (error) {
    console.error('Failed to connect to XRPL Testnet:', error);
  } finally {
    // Disconnect from the Testnet
    await client.disconnect();
    console.log('Disconnected from XRPL Testnet');
  }
}

// Run the connection function
connectToTestnet();