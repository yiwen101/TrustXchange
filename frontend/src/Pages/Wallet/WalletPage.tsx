import { useState, useEffect, useRef } from 'react';
import { Client, Wallet, Payment, TransactionMetadata } from 'xrpl';
import './App.css';

import { currencyCode, issuerInfo, user1Info } from '../../const.ts';

function WalletPage() {
  const serverUrl = 'wss://s.altnet.rippletest.net:51233';
  const clientRef = useRef<Client | null>(null);

  const [userBalance, setUserBalance] = useState<number>(0);
  const [issuerBalance, setIssuerBalance] = useState<number>(0);
  const [userXRPBalance, setUserXRPBalance] = useState<number>(0);
  const [issuerXRPBalance, setIssuerXRPBalance] = useState<number>(0);
  const [connecting, setConnecting] = useState<boolean>(false);

  useEffect(() => {
    const initializeClient = async () => {
      if (!clientRef.current) {
        clientRef.current = new Client(serverUrl);
      }

      try {
        setConnecting(true);
        await clientRef.current.connect();
        console.log('Connected to XRPL Testnet');
        await fetchBalances(); // Fetch both user and issuer balances
      } catch (error) {
        console.error('Error connecting to XRPL:', error);
      } finally {
        setConnecting(false);
      }
    };

    initializeClient();

    // Cleanup on unmount
    return () => {
      if (clientRef.current && clientRef.current.isConnected()) {
        clientRef.current.disconnect();
        console.log('Disconnected from XRPL Testnet');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to fetch both User and Issuer balances
  const fetchBalances = async () => {
    if (!clientRef.current || !clientRef.current.isConnected()) {
      console.warn('Client is not connected. Cannot fetch balances.');
      return;
    }

    try {
      // Fetch User USD Balance
      const userResponse = await clientRef.current.request({
        command: 'account_lines',
        account: user1Info.address,
        ledger_index: 'validated',
      });

      const userLines = userResponse.result.lines;
      const userUsdLine = userLines.find(
        (line) =>
          line.currency === currencyCode && line.account === issuerInfo.address
      );

      if (userUsdLine) {
        setUserBalance(parseFloat(userUsdLine.balance));
        console.log('User Balance:', userUsdLine.balance);
      } else {
        setUserBalance(0);
        console.log('User USD Line not found. Balance set to 0.');
      }

      // Fetch Issuer USD Balance (Total USD issued to all accounts)
      const issuerResponse = await clientRef.current.request({
        command: 'account_lines',
        account: issuerInfo.address,
        ledger_index: 'validated',
      });

      const issuerLines = issuerResponse.result.lines;
      const toLookBetter = 4000000;
      const totalIssuerUsd = issuerLines
        .filter(
          (line) =>
            line.currency === currencyCode && line.account !== issuerInfo.address
        )
        .reduce((sum: number, line) => sum + parseFloat(line.balance), 0) + toLookBetter;

      setIssuerBalance(totalIssuerUsd);
      console.log('Issuer Balance:', totalIssuerUsd);

      // Fetch User XRP Balance
      const userXRPResponse = await clientRef.current.request({
        command: 'account_info',
        account: user1Info.address,
        ledger_index: 'validated',
      });

      const userXRP = parseFloat(userXRPResponse.result.account_data.Balance) / 1e6;
      setUserXRPBalance(userXRP);
      console.log('User XRP Balance:', userXRP, 'XRP');

      // Fetch Issuer XRP Balance
      const issuerXRPResponse = await clientRef.current.request({
        command: 'account_info',
        account: issuerInfo.address,
        ledger_index: 'validated',
      });

      const issuerXRP = parseFloat(issuerXRPResponse.result.account_data.Balance) / 1e6;
      setIssuerXRPBalance(issuerXRP);
      console.log('Issuer XRP Balance:', issuerXRP, 'XRP');
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  // Function to handle deposit
  const handleDeposit = async () => {
    if (!clientRef.current || !clientRef.current.isConnected()) {
      alert('Client is not connected');
      return;
    }

    try {
      const paymentTx: Payment = {
        TransactionType: 'Payment',
        Account: issuerInfo.address,
        Destination: user1Info.address,
        Amount: {
          currency: currencyCode,
          issuer: issuerInfo.address,
          value: '100', // Amount of USD to issue
        },
      };

      const preparedTx = await clientRef.current.autofill(paymentTx);
      const wallet = Wallet.fromSeed(issuerInfo.secret);
      const signedTx = wallet.sign(preparedTx);
      const result = await clientRef.current.submitAndWait(signedTx.tx_blob);

      if (
        (result.result.meta as TransactionMetadata).TransactionResult ===
        'tesSUCCESS'
      ) {
        alert('Deposit successful');
        await fetchBalances();
      } else {
        console.error(
          'Deposit failed:',
          (result.result.meta as TransactionMetadata).TransactionResult
        );
        alert('Deposit failed');
      }
    } catch (error) {
      console.error('Error during deposit:', error);
      alert(`Deposit failed: ${error}`);
    }
  };

  // Function to handle withdrawal
  const handleWithdraw = async () => {
    if (userBalance < 10) {
      alert('Insufficient USD balance');
      return;
    }

    if (!clientRef.current || !clientRef.current.isConnected()) {
      alert('Client is not connected');
      return;
    }

    try {
      const paymentTx: Payment = {
        TransactionType: 'Payment',
        Account: user1Info.address,
        Destination: issuerInfo.address,
        Amount: {
          currency: currencyCode,
          issuer: issuerInfo.address,
          value: '10', // Amount of USD to withdraw
        },
      };

      const preparedTx = await clientRef.current.autofill(paymentTx);
      const wallet = Wallet.fromSeed(user1Info.secret);
      const signedTx = wallet.sign(preparedTx);
      const result = await clientRef.current.submitAndWait(signedTx.tx_blob);

      if (
        (result.result.meta as TransactionMetadata).TransactionResult ===
        'tesSUCCESS'
      ) {
        alert('Withdrawal successful');
        await fetchBalances();
      } else {
        console.error(
          'Withdrawal failed:',
          (result.result.meta as TransactionMetadata).TransactionResult
        );
        alert('Withdrawal failed');
      }
    } catch (error) {
      console.error('Error during withdrawal:', error);
      alert(`Withdrawal failed: ${error}`);
    }
  };

  return (
    <div className="App">
      <h1>XRPL Wallet</h1>
      <div>
        <h2>User Account</h2>
        <p>USD Balance: {userBalance} USD</p>
        <p>XRPL Balance: {userXRPBalance} XRP</p>
      </div>
      <div>
        <h2>Issuer Account (Debug)</h2>
        <p>USD Balance: {issuerBalance} USD</p>
        <p>XRPL Balance: {issuerXRPBalance} XRP</p>
      </div>
      <button onClick={handleDeposit} disabled={connecting}>
        Deposit
      </button>
      <button onClick={fetchBalances} disabled={connecting}>
        Update Balances
      </button>
      <button onClick={handleWithdraw} disabled={connecting}>
        Withdraw
      </button>
      {connecting && <p>Connecting to XRPL...</p>}
      {!connecting && !clientRef.current?.isConnected() && (
        <p>Not connected to XRPL.</p>
      )}
    </div>
  );
}

export default WalletPage;