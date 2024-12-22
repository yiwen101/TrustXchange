const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const contract = require('@truffle/contract');
const LockArtifact = require('./build/contracts/Lock.json');
require('dotenv').config();

// Use the mnemonic from Ganache CLI
const mnemonic = 'cheap expose surge stool crew forget rule travel push grocery response raven';
const provider = new HDWalletProvider(mnemonic, 'http://127.0.0.1:8545');
const web3 = new Web3.Web3(provider);

const Lock = contract(LockArtifact);
Lock.setProvider(web3.currentProvider);

async function main() {
    const accounts = await web3.eth.getAccounts();
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = LockArtifact.networks[networkId];
  
    if (!deployedNetwork) {
      throw new Error(`Lock contract not deployed on network with ID ${networkId}`);
    }
    const balance = await web3.eth.getBalance(accounts[0]);
    console.log(`Balance: ${web3.utils.fromWei(balance, 'ether')} ETH`);
  
    const lockInstance = new web3.eth.Contract(
      LockArtifact.abi,
      deployedNetwork.address
    );
  
    // Lock tokens
    const amount = web3.utils.toWei('50', 'ether');
    const lockTime = Math.floor(Date.now() / 1000) + 10 * 60; // 10 minutes from now
  
    // Check balance before locking tokens
    console.log(`Locking ${amount} wei for 10 minutes from account ${accounts[0]}`);
    const balance2 = await web3.eth.getBalance(accounts[0]);
    console.log(`Balance: ${web3.utils.fromWei(balance2, 'ether')} ETH`);
    try {
      await lockInstance.methods.lockTokens(amount, lockTime).send({
        from: accounts[0],
        gasPrice: web3.utils.toWei('20', 'gwei'), // Specify gas price manually
      });
      console.log('Tokens locked successfully');
    } catch (error) {
      console.error('Error locking tokens:', error);
    }
  
    const balance3 = await web3.eth.getBalance(accounts[0]);
    console.log(`Balance after lock: ${web3.utils.fromWei(balance3, 'ether')} ETH`);
  
    // Get locked tokens
    try {
      const lockedTokens = await lockInstance.methods.getLockedTokens(accounts[0]).call();
      console.log(`Locked Amount: ${web3.utils.fromWei(lockedTokens.amount, 'ether')} ETH`);
      console.log(`Unlock Time: ${new Date(Number(lockedTokens.unlockTime) * 1000).toLocaleString()}`);
    } catch (error) {
      console.error('Error getting locked tokens:', error);
    }
  }

main().then(() => {
  console.log("then executed");
}).catch((error) => {
  console.error("Error in main:", error);
}).finally(() => {
  provider.engine.stop();
});