const xrpl = require('xrpl');
const fs = require('fs');

async function main() {
  // Connect to the Testnet
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233/');
  await client.connect();

  // Create a new wallet
  const wallet = xrpl.Wallet.generate();
  console.log(`Generated wallet address: ${wallet.address}`);
  const account_detail = {
    address: wallet.address,
    secret: wallet.seed,
    publicKey: wallet.publicKey,
    privateKey: wallet.privateKey,
  }
  fs.writeFileSync('amm_creater.json', JSON.stringify(account_detail, null, 2));
  // Fund the wallet using the Testnet Faucet
  console.log('Requesting funds from the Testnet Faucet...');
  await client.fundWallet(wallet);
  console.log('Wallet funded.');
  for (let i = 0; i < 2; i++) {
    console.log(`Transfering 100 XRP to ${wallet.address} for ${i+1} time`);
    const { _wallet, balance } = await client.fundWallet(wallet);
    console.log(`Balance: ${balance}`);
  }

  // Define the issuer and currency
  const issuer = 'rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV';
  const currency = 'USD';

  // Establish a trust line with the issuer
  const trustSetTx = {
    TransactionType: 'TrustSet',
    Account: wallet.address,
    LimitAmount: {
      currency: currency,
      issuer: issuer,
      value: '1000000' // Set a high limit for testing purposes
    }
  };

  const preparedTx = await client.autofill(trustSetTx);
  const signedTx = wallet.sign(preparedTx);
  const result = await client.submitAndWait(signedTx.tx_blob);

  if (result.result.meta.TransactionResult === 'tesSUCCESS') {
    console.log('Trust line established successfully.');
  } else {
    console.error('Failed to establish trust line:', result.result.meta.TransactionResult);
  }

  // Check the account balances
  const accountInfo = await client.request({
    command: 'account_lines',
    account: wallet.address
  });

  console.log('Account balances:', accountInfo.result);

  // check xrp balance
    const xrpBalance = await client.getBalance(wallet.address);
    console.log('XRP balance:', xrpBalance);

  // Disconnect from the Testnet
  await client.disconnect();
}

main().catch(console.error);