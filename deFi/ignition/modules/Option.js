const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
require('dotenv').config();
const gatewayAddress = process.env.MY_GATEWAY_ADDRESS;
const priceOracleAddress = process.env.PRICE_ORACLE_ADDRESS;
console.log("gatewayAddress: ", gatewayAddress);
console.log("priceOracleAddress: ", priceOracleAddress);

module.exports = buildModule("OptionPModule", (m) => {
  // Define the parameter for the authModule address
  const gatewayAddressParam = m.getParameter("gateway_", gatewayAddress);

  // Deploy the MyAxelarGatewayImpl contract with the authModule parameter
  const XrpLendingP2P = m.contract("OptionTrading", [gatewayAddressParam]);

  // Return the deployed contract instance
  return {XrpLendingP2P};
});