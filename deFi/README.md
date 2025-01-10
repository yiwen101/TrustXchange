to deploy contract, do:
```shell
npx hardhat ignition deploy ./ignition/modules/<name> --network evm
```

to verify a contract (not necessary), do:
```shell
npx hardhat verify --network evm <DEPLOYED_CONTRACT_ADDRESS> <CONSTRUCTOR_ARGUMENTS>
```

reusable interface and abstract classes are put in common folder. poc is a sample of `AxelarExecutableWithToken`

you need to first put your user config (eg: private key) in the .env file as in .env.example. DO NOT COMMIT your .env file.