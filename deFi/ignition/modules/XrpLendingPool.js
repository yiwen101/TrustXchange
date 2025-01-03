const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
require('dotenv').config();
const gatewayAddress = process.env.MY_GATEWAY_ADDRESS;
const priceOracleAddress = process.env.PRICE_ORACLE_ADDRESS;
console.log("gatewayAddress: ", gatewayAddress);
console.log("priceOracleAddress: ", priceOracleAddress);
// Calculate the daily rate with 18 decimals precision (E18)


/*
 eg: 1.00026116 means daily rate is 0.026116%, means 10% annual rate as  1.00026116^365 = 1.1
    uint256 public dailyInterestFactorE18;
*/
const dailyFactor ="1000261157876067800";
module.exports = buildModule("XrpLendingPoolModule", (m) => {
  // Define the parameter for the authModule address
  const gatewayAddressParam = m.getParameter("gateway_", gatewayAddress);
  const priceOracleAddressParam = m.getParameter("priceOracle_", priceOracleAddress);
  const dailyRateParam = m.getParameter("dailyInterestFactorE18_", dailyFactor );

  // Deploy the MyAxelarGatewayImpl contract with the authModule parameter
  const XrpLendingPool = m.contract("XrpLendingPoolV4", [gatewayAddressParam, priceOracleAddressParam, dailyRateParam]);

  // Return the deployed contract instance
  return {XrpLendingPool};
});