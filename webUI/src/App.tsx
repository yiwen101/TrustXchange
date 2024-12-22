import { useState, useEffect, useRef } from 'react';
import { Client, Wallet, Payment, TransactionMetadata } from 'xrpl';
import { currencyCode } from './const';
import './App.css';

function App() {
  const serverUrl = 'wss://s.altnet.rippletest.net:51233';
  const clientRef = useRef<Client | null>(null);

  const issuer = {
    address: 'rGo4HdEE3wXToTqcEGxCAeaFYfqiRGdWSX',
    secret: 'sEdVms9ZY4tgP6viMxJWK4q1pKjzFSm',
  };

  const userAccount = {
    address: 'rB8KX92KiXugoNncVb6uAMkXtDTeo3BVcU',
    secret: 'sEd7ZHXbc1xt73PgnRa4PFed9bftfyv',
  };

  const [balance, setBalance] = useState<number>(0);
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
        await getBalance();
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

  // Function to fetch balance
  const getBalance = async () => {
    if (!clientRef.current || !clientRef.current.isConnected()) {
      console.warn('Client is not connected. Cannot fetch balance.');
      return;
    }

    try {
      const response = await clientRef.current.request({
        command: 'account_lines',
        account: userAccount.address,
        ledger_index: 'validated',
      });

      const lines = response.result.lines;
      const usdcLine = lines.find(
        (line: any) =>
          line.currency === currencyCode && line.account === issuer.address
      );

      if (usdcLine) {
        setBalance(parseFloat(usdcLine.balance));
        alert('Balance updated to ' + parseFloat(usdcLine.balance));
      } else {
        setBalance(0);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
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
        Account: issuer.address,
        Destination: userAccount.address,
        Amount: {
          currency: currencyCode,
          issuer: issuer.address,
          value: '100', // Amount of USDC to issue
        },
      };

      const preparedTx = await clientRef.current.autofill(paymentTx);
      const wallet = Wallet.fromSeed(issuer.secret);
      const signedTx = wallet.sign(preparedTx);
      const result = await clientRef.current.submitAndWait(signedTx.tx_blob);

      if (
        (result.result.meta as TransactionMetadata).TransactionResult ===
        'tesSUCCESS'
      ) {
        alert('Deposit successful');
        await getBalance();
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
    if (balance < 10) {
      alert('Insufficient USDC balance');
      return;
    }

    if (!clientRef.current || !clientRef.current.isConnected()) {
      alert('Client is not connected');
      return;
    }

    try {
      const paymentTx: Payment = {
        TransactionType: 'Payment',
        Account: userAccount.address,
        Destination: issuer.address,
        Amount: {
          currency: currencyCode,
          issuer: issuer.address,
          value: '10', // Amount of USDC to withdraw
        },
      };

      const preparedTx = await clientRef.current.autofill(paymentTx);
      const wallet = Wallet.fromSeed(userAccount.secret);
      const signedTx = wallet.sign(preparedTx);
      const result = await clientRef.current.submitAndWait(signedTx.tx_blob);

      if (
        (result.result.meta as TransactionMetadata).TransactionResult ===
        'tesSUCCESS'
      ) {
        alert('Withdrawal successful');
        await getBalance();
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
      <p>
        Balance: {balance} USD
      </p>
      <button onClick={handleDeposit} disabled={connecting}>
        Deposit
      </button>
      <button onClick={getBalance} disabled={connecting}>
        Update Balance
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

export default App;