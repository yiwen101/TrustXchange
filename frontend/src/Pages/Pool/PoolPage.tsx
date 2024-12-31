import React, { useState } from 'react';
import { Card, Button, Typography, TextField, Box, Stack } from '@mui/material';
import { XrpIcon, UsdcIcon } from '../../icons/Icons';
import { useConnectedWalletValues } from '../../hooks/useConnectedWallet';
import { useXrpPriceValue } from '../../hooks/usePriceState';
import xrp_api from '../../api/xrp';
import PieInfo from '../../Component/PieInfo';

const PoolPage = () => {
  const {connectedWallet,connectionStatus } = useConnectedWalletValues();
  const { ammInfo } = useXrpPriceValue(); // Get the AMM info
    const [xrpValueInput, setXrpValueInput] = useState('');
  const [usdValueInput, setUsdValueInput] = useState('');
  const [dp, setDp] = useState(2);

  const handleXrpValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      const usd_can_add = xrp_api.get_usd_can_get_with_xrp(parseFloat(value),ammInfo!);
    setUsdValueInput(usd_can_add.toFixed(dp))
    setXrpValueInput(value)
  };

  const handleUsdValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
        const xrp_can_add = xrp_api.get_xrp_needed_for_usd(parseFloat(value),ammInfo!);
    setXrpValueInput(xrp_can_add.toFixed(dp))
    setUsdValueInput(value)

  };


    const handleAddLiquidity = async () => {
       if (connectionStatus !== 'connected' || !connectedWallet ) {
         console.log('No connected wallet');
         return;
      }

       if (!ammInfo) {
         console.log('AMM data unavailable');
         return;
       }
      // convert the value to number
      const xrpAmount = parseFloat(xrpValueInput);
      const usdAmount = parseFloat(usdValueInput);
       if (isNaN(xrpAmount) || isNaN(usdAmount) || xrpAmount <= 0 || usdAmount <= 0) {
         console.log('Invalid input');
         return;
      }

      try {

        //  send the transaction with user's wallet
        console.log(`Adding Liquidity to Pool with XRP: ${xrpAmount} and USD: ${usdAmount}`);

        //  reset the input to zero
        setXrpValueInput('')
        setUsdValueInput('')


        // Call the deposit method of the smart contract. (Placeholder)
        //  const signer = provider.getSigner();
        // const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        // const tx = await contract.addLiquidity(ethers.utils.parseUnits(xrpAmount.toString(),18), ethers.utils.parseUnits(usdAmount.toString(),18));
        // console.log('Transaction Hash:', tx.hash);
         // await tx.wait(); // Wait for the transaction to be mined
         console.log('Liquidity added to pool');

      } catch (error) {
           console.error('Error adding liquidity:', error);
       }
   };

    const getLiquidityInfo = () => {
      if (!ammInfo) return null;
      return (
          <Stack>
            <Typography variant="body1">
              Liquidity Provider Token Total Supply:  {ammInfo.xrp_amount.toFixed(2)} XRP, {ammInfo.usd_amount.toFixed(2)} USD
            </Typography>
          </Stack>
      )
    }

  return (
    <Card style={{ padding: '20px', width: '300px', margin: 'auto' }}>
       <PieInfo usd_amount={ammInfo?.usd_amount || 0} xrp_amount={ammInfo?.xrp_amount || 0} />
        <Box mt={3}>
        <Typography variant="h6">Add Liquidity</Typography>
            <TextField
              label="XRP Amount"
              type="number"
              value={xrpValueInput}
              onChange={handleXrpValueChange}
              InputProps={{
                startAdornment: <Box mr={1}><XrpIcon /></Box>,
                }}
              fullWidth
              margin="normal"
             />
            <TextField
              label="USD Amount"
              type="number"
              value={usdValueInput}
               onChange={handleUsdValueChange}
              InputProps={{
                startAdornment: <Box mr={1}><UsdcIcon /></Box>,
               }}
              fullWidth
              margin="normal"
            />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddLiquidity}
            style={{ marginTop: '10px' , width: "100%"}}
            disabled={connectionStatus !== 'connected' }
        >
           {connectionStatus !== 'connected' ? 'Connect Wallet' : 'Add Liquidity'}
        </Button>
        </Box>
    </Card>
  );
};

export default PoolPage;