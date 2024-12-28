import { Client, LedgerResponse } from 'xrpl';
import { mainnet_url} from '../../const';
import { get_amm_info } from './amm_transection';

const ledger_close_time = (ledger: LedgerResponse): Date => new Date((946684800 + ledger.result.ledger.close_time) * 1000);
const ledger_index = (ledger: LedgerResponse): number => ledger.result.ledger.ledger_index;
const x_hour_before = (date: Date, x: number = 1): number => date.getTime() - (60 * 60 * 1000) * x;

async function get_estimated_ledger(date: Date, ledger: LedgerResponse | undefined = undefined): Promise<LedgerResponse> {
    const client = new Client('wss://s.altnet.rippletest.net:51233');
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
    return await get_xrp_price_at(new Date(hour_ago));
}

export async function get_xrp_price_day_ago(x: number): Promise<number> {
    return await get_xrp_price_hour_ago(24 * x);
}

export async function get_xrp_price_at(dateTime: Date): Promise<number> {
    const client = new Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();
    const ledger_index = await get_estimated_ledger_index(dateTime);
    await client.disconnect();
    const price = await get_xrp_price_at_ledger(ledger_index);
    const dateTimeFormatted = dateTime.toISOString();
    console.log(`Price at ${dateTimeFormatted}: ${price}`);
    return price;
}

export async function get_xrp_price_at_ledger(ledger_index:number|"validated" = "validated") {
    const client = new Client(mainnet_url);
    try {
        const info = await get_amm_info(true, ledger_index)
        return info.usd_amount/ info.xrp_amount;
    }  finally {
        await client.disconnect();
    }
}
