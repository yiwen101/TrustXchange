require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    evmSidechain: {
      url: "https://rpc-evm-sidechain.xrpl.org",
      chainId: 1440002,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
};
//0x89CfAcCEE2E5aBa00d1036AaD4Fb236bF04B2c94