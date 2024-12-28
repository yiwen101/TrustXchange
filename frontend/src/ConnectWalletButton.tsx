import { Button } from "@mui/material";
import React from "react";
import { useConnectedWalletActions } from "./hooks/useConnectedWallet";

export const ConnectWalletButton : React.FC = () => {
    const { connectOrCreateWallet} = useConnectedWalletActions();
    
    const handleConnectWallet = async () => {
        await connectOrCreateWallet();
    }
    return (
        <Button
        variant="contained"
        color="secondary"
        size="small"
        onClick={handleConnectWallet}
        sx={{
          borderRadius: '20px',
          textTransform: 'none',
          minWidth: '150px', // Ensure the width matches the ConnectedWallet component
        }}
      >
        Connect Wallet
      </Button>
    );
}
export default ConnectWalletButton;