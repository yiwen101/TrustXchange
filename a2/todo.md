### **Step 5: Monitor the `ContractCallApproved` Event**

After submitting the transaction:

1. **Wait for Confirmation:**
   - The Axelar relayer will process the transaction.
   - Validators will approve the payload hash.
   - A `ContractCallApproved` event will be emitted on the XRPL EVM Sidechain via the Axelar Amplifier Gateway.

2. **Retrieve `commandId`:**
   - Use a blockchain explorer or set up an event listener to capture the `ContractCallApproved` event.
   - Extract the `commandId` from the event logs.

---

### **Step 6: Execute the Smart Contract Function**

Once you have the `commandId`, execute the `execute` function on your `AxelarExecutable` contract to set the message.

1. **Define Variables:**

   ```bash
   AXELAR_EXECUTABLE=YOUR_AXELAR_EXECUTABLE_ADDRESS
   COMMAND_ID=THE_COMMAND_ID_OBTAINED_FROM_EVENT
   SOURCE_ADDRESS=USER_XRPL_ADDRESS
   PAYLOAD=ABI_ENCODED_PAYLOAD // Same as gmpPayload
   PRIVATE_KEY=YOUR_PRIVATE_KEY
   XRPL_EVM_RPC_URL=YOUR_XRPL_EVM_RPC_URL
   ```

2. **Execute Using `cast`:**

   Ensure you have Foundry installed to use the `cast` tool. If not, install it from [Foundry Installation Guide](https://book.getfoundry.sh/getting-started/installation).

   ```bash
   cast send $AXELAR_EXECUTABLE "execute(bytes32,string,string,bytes)" \
   $COMMAND_ID "ethereum" "$SOURCE_ADDRESS" "$gmpPayload" \
   --private-key $PRIVATE_KEY \
   --rpc-url $XRPL_EVM_RPC_URL
   ```

   **Note:** Replace the placeholders with your actual values:
   
   - `YOUR_AXELAR_EXECUTABLE_ADDRESS`: Replace with your `AxelarExecutable` contract address.
   - `THE_COMMAND_ID_OBTAINED_FROM_EVENT`: The `commandId` from the `ContractCallApproved` event.
   - `USER_XRPL_ADDRESS`: Your XRPL wallet address.
   - `YOUR_PRIVATE_KEY`: Private key associated with your XRPL address.
   - `YOUR_XRPL_EVM_RPC_URL`: RPC URL for the XRPL EVM Sidechain (e.g., Sepolia testnet).

3. **Verify Execution:**

   - **Check Contract Message:**

     ```bash
     cast call 0x68246D1C63f1182FCe9694c36bcc678494E3fd46 "message() view returns (string)"
     ```

     **Expected Output:**

     ```
     "message 1"
     ```

   - **Check Events:**
     - Ensure that the `Executed` event was emitted with the correct parameters by reviewing transaction logs on a blockchain explorer or using event listeners.

---

### **Summary**

By following these steps, you've successfully:

1. **Constructed and Submitted an XRPL Payment Transaction:**
   - Included the necessary [`Memos`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2FUsers%2Fsoftmark%2FDesktop%2Fripple%2FTemp%2Fa2%2Fscript.js%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A19%2C%22character%22%3A8%7D%7D%5D%2C%22940f2948-99f8-4474-93f9-b862ba9d3cfc%22%5D "Go to definition") with your [`ExecutableSample`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2FUsers%2Fsoftmark%2FDesktop%2Fripple%2FTemp%2Fa2%2Fscript.js%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A22%2C%22character%22%3A82%7D%7D%5D%2C%22940f2948-99f8-4474-93f9-b862ba9d3cfc%22%5D "Go to definition") contract address and the payload hash.

2. **Encoded the Payload:**
   - Set the message to `"message 1"` and computed its Keccak256 hash.

3. **Executed the Smart Contract Function:**
   - Used the `cast` tool to call the `execute` function on your `AxelarExecutable` contract with the appropriate parameters.

4. **Verified the Execution:**
   - Confirmed that the `message` variable in your [`ExecutableSample`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2FUsers%2Fsoftmark%2FDesktop%2Fripple%2FTemp%2Fa2%2Fscript.js%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A22%2C%22character%22%3A82%7D%7D%5D%2C%22940f2948-99f8-4474-93f9-b862ba9d3cfc%22%5D "Go to definition") contract was updated to `"message 1"`.

---

### **Additional Tips**

- **Security:**
  - **Private Keys:** Always secure your private keys. Avoid hardcoding them in scripts. Consider using environment variables or secure key management systems.
  
- **Testing:**
  - **Testnets:** Before deploying on the mainnet, thoroughly test your setup on testnets to ensure everything works as expected.
  
- **Error Handling:**
  - Implement robust error handling in your scripts to catch and address issues during transaction submission or contract execution.
  
- **Logging:**
  - Add logging statements to monitor the progress and debug any issues that arise during the process.

For more detailed information, refer to the [Axelar GMP Documentation](https://axelar.network/docs) and [Hardhat Documentation](https://hardhat.org/docs).