import { Client, Wallet, Payment } from 'xrpl';

export class XRPWallet {
    private client: Client;
    private wallet: Wallet | null = null;

    constructor(isTestnet: boolean = true) {
        this.client = new Client(isTestnet 
            ? 'wss://s.altnet.rippletest.net:51233'
            : 'wss://xrplcluster.com');
    }

    async connect() {
        try {
            if (!this.client.isConnected()) {
                await this.client.connect();
            }
            return true;
        } catch (error) {
            console.error('Failed to connect to XRP Ledger:', error);
            throw error;
        }
    }

    async createWallet() {
        try {
            await this.connect();
            const { wallet, balance } = await this.client.fundWallet();
            this.wallet = wallet;
            return {
                address: wallet.address,
                seed: wallet.seed,
                publicKey: wallet.publicKey,
                privateKey: wallet.privateKey,
                balance
            };
        } catch (error) {
            console.error('Failed to create wallet:', error);
            throw error;
        }
    }

    async importWallet(seed: string) {
        try {
            this.wallet = Wallet.fromSeed(seed);
            const balance = await this.getBalance(this.wallet.address);
            return {
                address: this.wallet.address,
                publicKey: this.wallet.publicKey,
                balance
            };
        } catch (error) {
            console.error('Failed to import wallet:', error);
            throw error;
        }
    }

    async getBalance(address: string) {
        try {
            await this.connect();
            const response = await this.client.getXrpBalance(address);
            return response;
        } catch (error) {
            console.error('Failed to get balance:', error);
            throw error;
        }
    }

    async establishTrustline(currency: string, issuer: string, limit: string = "1000000000") {
        if (!this.wallet) {
            throw new Error('No wallet loaded');
        }

        try {
            await this.connect();
            const tx = {
                TransactionType: "TrustSet",
                Account: this.wallet.address,
                LimitAmount: {
                    currency,
                    issuer,
                    value: limit
                },
                Fee: "10"
            };

            const prepared = await this.client.autofill(tx);
            const signed = this.wallet.sign(prepared);
            const result = await this.client.submitAndWait(signed.tx_blob);
            return result;
        } catch (error) {
            console.error('Failed to establish trustline:', error);
            throw error;
        }
    }

    async sendPayment(destination: string, amount: string, currency: string = "XRP", issuer?: string) {
        if (!this.wallet) {
            throw new Error('No wallet loaded');
        }

        try {
            await this.connect();
            const payment: Payment = {
                TransactionType: "Payment",
                Account: this.wallet.address,
                Destination: destination,
                Amount: currency === "XRP" 
                    ? amount 
                    : {
                        currency,
                        value: amount,
                        issuer: issuer!
                    },
                Fee: "10"
            };

            const prepared = await this.client.autofill(payment);
            const signed = this.wallet.sign(prepared);
            const result = await this.client.submitAndWait(signed.tx_blob);
            return result;
        } catch (error) {
            console.error('Failed to send payment:', error);
            throw error;
        }
    }

    getWallet() {
        return this.wallet;
    }

    isConnected() {
        return this.client.isConnected();
    }

    async disconnect() {
        if (this.client.isConnected()) {
            await this.client.disconnect();
        }
    }

    async getLPTokenBalance(currency: string, issuer: string) {
        if (!this.wallet) {
            throw new Error('No wallet loaded');
        }

        try {
            const response = await this.client.request({
                command: "account_lines",
                account: this.wallet.address,
                peer: issuer
            });

            const line = response.result.lines.find(
                (l: any) => l.currency === currency
            );

            return line ? line.balance : "0";
        } catch (error) {
            console.error('Failed to get LP token balance:', error);
            throw error;
        }
    }

    async getAllBalances() {
        if (!this.wallet) {
            throw new Error('No wallet loaded');
        }

        try {
            const [xrpBalance, tokenBalances] = await Promise.all([
                this.getBalance(this.wallet.address),
                this.getTokenBalances()
            ]);

            return {
                xrp: xrpBalance,
                tokens: tokenBalances
            };
        } catch (error) {
            console.error('Failed to get all balances:', error);
            throw error;
        }
    }

    private async getTokenBalances() {
        const response = await this.client.request({
            command: "account_lines",
            account: this.wallet!.address
        });

        return response.result.lines.map((line: any) => ({
            currency: line.currency,
            issuer: line.account,
            value: line.balance
        }));
    }

    async signMessage(message: string): Promise<string> {
        if (!this.wallet) {
            throw new Error('No wallet loaded');
        }

        try {
            return this.wallet.sign(message);
        } catch (error) {
            console.error('Failed to sign message:', error);
            throw error;
        }
    }

    async verifySignature(
        message: string,
        signature: string,
        publicKey: string
    ): Promise<boolean> {
        try {
            return Wallet.verifySignature(message, signature, publicKey);
        } catch (error) {
            console.error('Failed to verify signature:', error);
            throw error;
        }
    }
}