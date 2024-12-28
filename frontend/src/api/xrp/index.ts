import * as amm_transection from './amm_transection';
import * as common from './common';
import * as usd_transection from './usd_transection';
import * as wallet from './wallet';
import * as xrp_price from './xrp_price';

const xrp_api = {
    ...amm_transection,
    ...common,
    ...usd_transection,
    ...wallet,
    ...xrp_price,
};
Object.freeze(xrp_api);

export default xrp_api;