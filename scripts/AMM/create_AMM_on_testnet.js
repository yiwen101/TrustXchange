import * as utils from './utils.js';
import * as xrpl from 'xrpl';
import { USDC_issuer,USDC_currency_code,testnet_url,trust_line_limit } from './const.js';
async function main() {
  const client = new xrpl.Client(testnet_url);
  await client.connect();
  const wallet = utils.load_wallet_from_file('amm_creater.json');
  await utils.log_xrp_balance(client,wallet);
  await utils.log_usd_balance(client,wallet);
  await utils.check_AMM_exist(client);
  //await utils.create_XRP_USDC_AMM(client,wallet);
  //const wallet = await utils.create_and_write_wallet('amm_creater.json');
   /*
  await utils.log_xrp_balance(client,wallet);
  await utils.log_usd_balance(client,wallet);
  await utils.fund_wallet(client,wallet,"500");
  await utils.log_xrp_balance(client,wallet);
  await utils.send_usd_to(client,wallet);
  await utils.log_usd_balance(client,wallet);
  */
  await client.disconnect();
}

main().catch(console.error);