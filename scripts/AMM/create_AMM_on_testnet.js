import * as utils from './utils.js';


async function main() {
  const wallet = utils.load_wallet_from_file('amm_creater.json');
  //const wallet = await utils.create_and_write_wallet('amm_creater.json');
  await utils.log_xrp_balance(wallet);
  await utils.log_usd_balance(wallet);
  await utils.fund_wallet(wallet,"500");
  await utils.log_xrp_balance(wallet);
  await utils.send_usd_to(wallet);
  await utils.log_usd_balance(wallet);
}

main().catch(console.error);