import * as amm_transection from './amm_transection';
import * as common from './common';
import * as usd_transection from './usd_transection';
import * as wallet from './wallet';
import * as xrp_price from './xrp_price';

const api = {
    amm_transection,
    common,
    usd_transection,
    wallet,
    xrp_price,
};
Object.freeze(api);

export default api;