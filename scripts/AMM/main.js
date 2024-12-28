import * as utils from './utils.js';
import * as xrpl from 'xrpl';
import { testnet_url} from './const.js';
async function main() {
  const client = new xrpl.Client(testnet_url);
  await client.connect();
  /*
  await utils.top_up_amm(client);
  const latestest_xrp_price = await utils.get_latest_xrp_price();
  */
 const x = await utils.gat_xrp_price_at_ledger()
 console.log(`x is ${x}`)
 await utils.get_latest_xrp_price();
 for(let i=1;i<=10;i++){
  await utils.get_xrp_price_hour_ago(24*i)
 }
  //console.log(`latestest_xrp_price: ${latestest_xrp_price}`);
  /*
 
  await client.connect();
  const wallet = utils.load_wallet_from_file('amm_creater.json');
  for (let i = 0; i < 10; i++) {
    await utils.fund_wallet(client,wallet,"1000");
  }
  await utils.send_usd_to(client,wallet,'30000');
  //await utils.add_xrp_to_XRP_USDC_AMM(client,wallet,10000);
  await utils.add_usd_to_XRP_USDC_AMM(client,wallet,30000);
  await utils.add_xrp_to_XRP_USDC_AMM(client,wallet,10000);
  await utils.log_xrp_balance(client,wallet);
  await utils.log_usd_balance(client,wallet);
  const info = await utils.check_AMM_exist(client);
  */
  /*
  const amount_can_get_with_10_usd = await utils.get_xrp_can_get_with_usd(client,10,info);
  const amount_needed_for_10_usd = await utils.get_xrp_needed_for_usd(client,10,info);
  const amount_can_get_with_10_xrp = await utils.get_usd_can_get_with_xrp(client,10,info);
  const amount_needed_for_10_xrp = await utils.get_usd_needed_for_xrp(client,10,info);
  console.log(`can get ${amount_can_get_with_10_usd} XRP with 10 USD`);
  console.log(`can get ${amount_can_get_with_10_xrp} USD with 10 XRP`);
  console.log(`need ${amount_needed_for_10_usd} XRP for 10 USD`);
  console.log(`need ${amount_needed_for_10_xrp} USD for 10 XRP`);
  await utils.swap_usdc_for_XRP(client,wallet,20,10);
  await utils.log_xrp_balance(client,wallet);
  await utils.log_usd_balance(client,wallet);
  await utils.check_AMM_exist(client);
  */
  /*
  await utils.add_usd_to_XRP_USDC_AMM(client,wallet,100);
  await utils.check_AMM_exist(client);
  await utils.add_xrp_to_XRP_USDC_AMM(client,wallet,10);
  await utils.check_AMM_exist(client);
  */
  
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