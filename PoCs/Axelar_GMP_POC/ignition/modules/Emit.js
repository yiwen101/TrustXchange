const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("EmitModule", (m) => {
    const emit = m.contract("Emit", []);
});