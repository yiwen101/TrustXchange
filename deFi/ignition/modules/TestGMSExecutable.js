const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
require('dotenv').config();
const MY_GATEWAY_ADDRESS = process.env.MY_GATEWAY_ADDRESS;
console.log('gateway address: ', MY_GATEWAY_ADDRESS);

module.exports = buildModule("TestGMSExecutableModule2", (m) => {
  // Define the parameter for the authModule address
  const gateway_ = m.getParameter("gateway_", MY_GATEWAY_ADDRESS);

  // Deploy the MyAxelarGatewayImpl contract with the authModule parameter
  const TestGMSExecutableModule = m.contract("TestGMSExecutableV3", [gateway_]);

  // Return the deployed contract instance
  return { TestGMSExecutableModule };
});