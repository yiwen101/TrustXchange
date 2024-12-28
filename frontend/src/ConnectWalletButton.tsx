import { Button } from "@mui/material";
import React from "react";
import { useConnectedWalletActions } from "./hooks/useConnectedWallet";
import { useXRPLClient } from "./hooks/useConnectedClient";

export const ConnectWalletButton : React.FC = () => {
    const { connectOrCreateWallet} = useConnectedWalletActions();
    const { get_connected_client } = useXRPLClient();
    
    const handleConnectWallet = async () => {
        const client = await get_connected_client();
        await connectOrCreateWallet(client);
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