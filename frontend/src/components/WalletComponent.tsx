import React from 'react';
import { useConnectedWalletValues, useConnectedWalletActions } from '../hooks/useConnectedWallet';
import './WalletComponent.css';

const WalletComponent: React.FC = () => {
    const { connectionStatus, balances } = useConnectedWalletValues();
    const { connectOrCreateWallet, disconnectWallet, getTruncatedAddress } = useConnectedWalletActions();

    return (
        <div className="wallet-container">
            {connectionStatus === "disconnected" ? (
                <div className="wallet-connect">
                    <h2>Connect Your Wallet</h2>
                    <button onClick={connectOrCreateWallet}>Connect Wallet</button>
                </div>
            ) : connectionStatus === "connecting" ? (
                <div className="wallet-connecting">
                    <p>Connecting to wallet...</p>
                </div>
            ) : (
                <div className="wallet-connected">
                    <h2>Wallet Connected</h2>
                    <p>Address: {getTruncatedAddress()}</p>
                    <div className="balances">
                        <div className="balance-item">
                            <h3>XRP Balance</h3>
                            <p>{balances.xrp.toFixed(2)} XRP</p>
                        </div>
                        <div className="balance-item">
                            <h3>USD Balance</h3>
                            <p>${balances.usd.toFixed(2)}</p>
                        </div>
                    </div>
                    <button onClick={disconnectWallet}>Disconnect Wallet</button>
                </div>
            )}
        </div>
    );
};

export default WalletComponent; 