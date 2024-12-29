const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
require('dotenv').config();
const PUBLIC_ADDRESS = process.env.PUBLIC_ADDRESS;
console.log('public address: ', PUBLIC_ADDRESS);

module.exports = buildModule("MyAxelarGatewayModule", (m) => {
  // Define the parameter for the authModule address
  const authModule = m.getParameter("authModule", PUBLIC_ADDRESS);

  // Deploy the MyAxelarGatewayImpl contract with the authModule parameter
  const myAxelarGateway = m.contract("MyAxelarGatewayImpl", [authModule]);

  // Return the deployed contract instance
  return { myAxelarGateway };
});