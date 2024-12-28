import * as fs from 'fs';
import { Client, Wallet } from 'xrpl';
import { establish_usdc_trust_line, send_usd_to } from './usd_transection';

export function load_wallet_from_file(fileName: string): Wallet|undefined {
    if (!fs.existsSync(fileName)) {
        return undefined;
    }
    const data = fs.readFileSync(fileName, 'utf8');
    const obj = JSON.parse(data);
    const wallet = Wallet.fromSeed(obj.secret);
    return wallet;
}

export async function create_wallet(): Promise<any> {
    const client = new Client('wss://s.altnet.rippletest.net:51233');
    try {
        await client.connect();
        console.log(`is client connected: ${client.isConnected()}`);
        console.log('Funding wallet... at line 20');
        const {wallet, balance} = await client.fundWallet();
        console.log(`Wallet funded. New balance: ${balance}`);
        const account_detail = {
            address: wallet.address,
            secret: wallet.seed,
            publicKey: wallet.publicKey,
            privateKey: wallet.privateKey,
        };
        console.log(`account_detail: ${JSON.stringify(account_detail)}`);
        return wallet;
    } catch (error) {
        alert('Failed to create wallet');
        console.error('error:', error);
    } finally {
        await client.disconnect();
    }
}

export async function get_funded_wallet_with_usd(client: Client, xrp_amount: number, usd_amount: number): Promise<Wallet> {
    let wallet = undefined
    if (!wallet) {
        console.log('Creating wallet...');
        wallet = await create_wallet();
        console.log(`Created wallet: ${wallet.address} at line 39`);
    }
    while(xrp_amount > 0) {
        if (xrp_amount > 1000) {
            const {balance} = await client.fundWallet(wallet,  { amount: xrp_amount.toString() });
            console.log(`Wallet funded. New balance: ${balance}`);
            xrp_amount -= 1000;
        } else {
            await client.fundWallet(wallet, { amount: xrp_amount.toString() });
            xrp_amount = 0;
        }
    }
    console.log(`Establishing trust line for wallet: ${wallet.address}`);
    establish_usdc_trust_line(client, wallet);
    console.log(`Sending ${usd_amount} USD to wallet: ${wallet.address}`);
    send_usd_to(client, wallet, usd_amount.toString());
    return wallet;
}

export async function fund_wallet(client: Client, wallet: Wallet, amountStr: string = '1000'): Promise<void> {
    try {
        console.log(`Funding wallet: ${wallet.address} with ${amountStr} XRP`);
        const { balance } = await client.fundWallet(wallet, { amount: amountStr });
        console.log(`Wallet funded. New balance: ${balance}`);
    } catch (error) {
        console.error('error:', error);
    }
}