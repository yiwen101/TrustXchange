const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const SOURCE_CHAIN = "source-chain-name";
const SOURCE_ADDRESS = "source-address";
const MESSAGE = "Your message here";
const TOKEN_DENOM = "TOKEN";
const TOKEN_AMOUNT = 5;
const AxelarGateway=`0x48CF6E93C4C1b014F719Db2aeF049AA86A255fE2`

module.exports = buildModule("ExecutableSampleModule", (m) => {
  const sourceChain = m.getParameter("sourceChain", SOURCE_CHAIN);
  const sourceAddress = m.getParameter("sourceAddress", SOURCE_ADDRESS);
  const message = m.getParameter("message", MESSAGE);
  const tokenDenom = m.getParameter("tokenDenom", TOKEN_DENOM);
  const tokenAmount = m.getParameter("tokenAmount", TOKEN_AMOUNT);

  const executableSample = m.contract("ExecutableSample", [
    AxelarGateway,
  ]);

  return { executableSample };
});