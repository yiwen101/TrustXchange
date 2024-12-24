require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    xrplEvmSidechainDevnet: {
      provider: () => new HDWalletProvider(
        process.env.MNEMONIC,
        'https://rpc-evm-sidechain.xrpl.org'
      ),
      network_id: 1440002,
      gas: 4500000, // Set to a reasonable value
      gasPrice: 100000000000, // Set to 100 Gwei
    },
  },
  compilers: {
    solc: {
      version: "0.8.9", 
    },
  },
};