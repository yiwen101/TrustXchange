import { IssuedCurrencyAmount} from "xrpl";

export const currencyCode = '5553444300000000000000000000000000000000';

export const user1Info = {
    address: 'rB8KX92KiXugoNncVb6uAMkXtDTeo3BVcU',
    secret: 'sEd7ZHXbc1xt73PgnRa4PFed9bftfyv', 
};

// fake
// put in frontend for ease of "issue usd" for mock
// production should only have issuer address
export const USDC_issuer = {
    address: "rGo4HdEE3wXToTqcEGxCAeaFYfqiRGdWSX",
    secret: "sEdVms9ZY4tgP6viMxJWK4q1pKjzFSm",
    publicKey: "ED74EC4754A1F30BC776E50CBEA24384F35661367BE218B14E4EFD269FDA3C9150",
    privateKey: "EDF6E99F4FB5C9124B538EB55C3F88254D220F0EA251331E18265F86491E5E6BB0",
};
export const USDC_currency_code = '5553444300000000000000000000000000000000'
export const testnet_url = 'wss://s.altnet.rippletest.net:51233'
export const mainnet_url = 'wss://s1.ripple.com'


export const mannnet_usd_issuer_address = 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De'
// could not find exsiting RLUSD to XRP AMM on mainnet, so use Bitstamp USD one's to get price. RLUSD is more desirable, will change to RLUSD when available
export const mannnet_Bitstamp_usd_address = 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'

// 1Billon
export const trust_line_limit = '1000000000';
export const EXPLORER = 'https://testnet.xrpl.org'
export const BACKEND_URL = 'http://localhost:8080'
export const XRP_LENDING_P2P = '0x9bB6D34405F7014979694242F4373fe83d038827'
export const XRP_LENDING_POOL = '0x73f58074490bA15216B5eE88f6Be96FbD729e6A6'
export const OPTION_TRADING = '0x82189dEeeC0310fd147f2423093f4B1F8F95BFc8'
export const XRPL_RPC_URL = 'wss://s.devnet.rippletest.net:51233/'
export const XRPL_MULTISIG_ADDRESS = "rfv9EskzSdWEsZsyBrujtidD2qdgiz8v7W";

export const usdIssuedCurrency = (amount:number) : IssuedCurrencyAmount => {
    return {
        value: amount.toString(),
        currency: USDC_currency_code,
        issuer: USDC_issuer.address
    } as IssuedCurrencyAmount
}

// transfer integer xrp amount to drop string
export const xrpCurrency = (amount: number): string => {
    const drops = amount * 1000000;
    return drops.toString();
}