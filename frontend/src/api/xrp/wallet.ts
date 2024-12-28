import * as fs from 'fs';
import { Client, Wallet } from 'xrpl';

export function load_wallet_from_file(fileName: string): Wallet {
    const data = fs.readFileSync(fileName, 'utf8');
    const obj = JSON.parse(data);
    const wallet = Wallet.fromSeed(obj.secret);
    return wallet;
}

export async function create_and_write_wallet(client: Client, fileName: string): Promise<Wallet> {
    const wallet = Wallet.generate();
    console.log(`Generated wallet address: ${wallet.address}`);
    // Create a new wallet
    await client.fundWallet(wallet);
    const account_detail = {
        address: wallet.address,
        secret: wallet.seed,
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey,
    };
    fs.writeFileSync(fileName, JSON.stringify(account_detail, null, 2));
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