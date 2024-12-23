async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
  
    const AxelarExecutable = await ethers.getContractFactory("AxelarExecutable");
    const axelarExecutable = await AxelarExecutable.deploy("GATEWAY_ADDRESS"); // Replace with actual gateway address
    await axelarExecutable.deployed();
    console.log("AxelarExecutable deployed to:", axelarExecutable.address);
  
    const DeFiApp = await ethers.getContractFactory("DeFiApp");
    const defiApp = await DeFiApp.deploy(axelarExecutable.address, "TOKEN_ADDRESS"); // Replace with actual token address
    await defiApp.deployed();
    console.log("DeFiApp deployed to:", defiApp.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });