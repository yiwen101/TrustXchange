import { AMMInfoRequest, AMMInfoResponse, Client, dropsToXrp, IssuedCurrencyAmount, LedgerResponse } from 'xrpl';
import { mainnet_url, mannnet_Bitstamp_usd_address} from '../../const';

const ledger_close_time = (ledger: LedgerResponse): Date => new Date((946684800 + ledger.result.ledger.close_time) * 1000);
const ledger_index = (ledger: LedgerResponse): number => ledger.result.ledger.ledger_index;
const x_hour_before = (date: Date, x: number = 1): number => date - (60 * 60 * 1000) * x

async function get_estimated_ledger(date: Date, ledger: LedgerResponse | undefined = undefined): Promise<LedgerResponse> {
    const client = new Client(mainnet_url);
    try {
      await client.connect();
      if (!ledger) {
        ledger = await client.request({
          command: 'ledger',
          ledger_index: 'validated',
          include_all_data: false
        });
      }
      if (!ledger) {
        throw new Error('Failed to get ledger');
      }
      const index = ledger_index(ledger);
      const close_time = ledger_close_time(ledger);
  
      const time_diff = close_time.getTime() - date.getTime();
      const time_diff_in_minutes = time_diff / 60000;
      const estimated_index = index - Math.floor(time_diff_in_minutes * 19.5);
      const estimated_ledger = await client.request({
        command: 'ledger',
        ledger_index: estimated_index,
        include_all_data: false
      });
      return estimated_ledger;
    } catch (error) {
      console.error('Error in get_estimated_ledger:', error);
      throw error;
    } finally {
      await client.disconnect();
    }
  }

export async function get_estimated_ledger_index( date: Date, ledger: LedgerResponse|undefined = undefined): Promise<number> {
    const estimated_ledger = await get_estimated_ledger( date, ledger);
    return ledger_index(estimated_ledger);
}

export async function get_estimated_ledger_close_time( date: Date, ledger: LedgerResponse|undefined = undefined): Promise<Date> {
    const estimated_ledger = await get_estimated_ledger(date, ledger);
    return ledger_close_time(estimated_ledger);
}

export async function get_latest_xrp_price(): Promise<number> {
    const price = await get_xrp_price_at_ledger("validated");
    console.log(`Latest price: ${price}`);
    return price;
}

export async function get_xrp_price_hour_ago(x: number): Promise<number> {
    const date = new Date();
    const hour_ago = x_hour_before(date, x);
    return await get_xrp_price_at(new Date(hour_ago))
}

export async function get_xrp_price_day_ago(x: number): Promise<number> {
    return await get_xrp_price_hour_ago(24 * x);
}

export async function get_xrp_price_at(dateTime: Date): Promise<number> {
    const client = new Client(mainnet_url);
    await client.connect();
    const ledger_index = await get_estimated_ledger_index(dateTime);
    await client.disconnect();
    const price = await get_xrp_price_at_ledger(ledger_index);
    const dateTimeFormatted = new Date(dateTime).toISOString();
    console.log(`Price at ${dateTimeFormatted}: ${price}`);
    return price!;
}

export async function get_xrp_price_at_ledger(ledger_index:number|"validated" = "validated") {
    /*
    const info = await get_amm_info(true, ledger_index)
    return info.usd_amount/ info.xrp_amount;
    */
    console.log(`mainnet url ${mainnet_url}`)
    console.log(`mannnet_Bitstamp_usd_address ${mannnet_Bitstamp_usd_address}`)
    const client = new Client(mainnet_url);
    try {
        await client.connect();
        const amm_info_request = {
            command: "amm_info",
            asset: {
                currency: "XRP",
                },
            asset2: {
                currency: 'USD',
                issuer: mannnet_Bitstamp_usd_address
                },
            ledger_index: ledger_index
        }
        console.log("line100")
        console.log(`ledger_index`,ledger_index)
        const amm_info_result = await client.request(amm_info_request as AMMInfoRequest) as AMMInfoResponse
        console.log("line102",ledger_index,amm_info_result)
        const usd_amount = amm_info_result.result.amm.amount2.value
        const xrp_amount_drops = amm_info_result.result.amm.amount as string
        const xrp_amount = dropsToXrp(xrp_amount_drops)
        const res = usd_amount/xrp_amount
        console.log(`res is ${res}`)
        return usd_amount/xrp_amount
    } catch(err) {
              console.log(err)
    } finally {
        await client.disconnect();
    }
}
