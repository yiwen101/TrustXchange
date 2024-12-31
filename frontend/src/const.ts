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