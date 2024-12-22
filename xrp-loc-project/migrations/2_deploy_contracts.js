// migrations/2_deploy_contracts.js
const Lock = artifacts.require("Lock");

module.exports = function (deployer) {
  deployer.deploy(Lock);
};