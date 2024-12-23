const ES = artifacts.require("executable/examples/ExecutableSample");

module.exports = function (deployer) {
  deployer.deploy(ES, `0x48CF6E93C4C1b014F719Db2aeF049AA86A255fE2`); // Replace with the actual gateway address
};