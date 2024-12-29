require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    evm: {
      url: "https://rpc-evm-sidechain.xrpl.org",
      chainId: 1440002,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
      'xrpl-evm': 'empty'
    },
    customChains: [
      {
        network: "xrpl-evm",
        chainId: 1440002,
        urls: {
          apiURL: "https://explorer.xrplevm.org/api",
          browserURL: "https://explorer.xrplevm.org"
        }
      }
    ]
  }
};