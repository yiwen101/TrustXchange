import { atom, useRecoilState } from "recoil";
import xrp_api from "../api/xrp";
import { AMMInfo } from "../api/xrp/amm_transection";
import { useRef } from "react";

const xrpPriceState = atom({
    key: "XRP_PRICE",
    default: null as  number | null,
});

const xrpPriceYesterdayState = atom({
    key: "XRP_PRICE_YESTERDAY",
    default: null as  number | null,
});

const xrpAMMState = atom({
    key: "XRP_AMM_INFO",
    default: null as  AMMInfo | null,
});

export const useXrpPriceState = () => {
    const [xrpPrice, setXrpPrice] = useRecoilState(xrpPriceState);
    const [xrpPriceYesterday, setXrpPriceYesterday] = useRecoilState(xrpPriceYesterdayState);
    const [ammInfo, setAmmInfo] = useRecoilState(xrpAMMState);
    const isInitialized = useRef(false);
    const init = async () => {
        if (isInitialized.current) {
            return;
        }
        isInitialized.current = true;
        console.log("init")
        try {
            const _latest_price = await xrp_api.get_xrp_price_at_ledger()
            console.log(`latest price ${_latest_price}`)
            setXrpPrice(_latest_price!)
            const _yesterday_price = await xrp_api.get_xrp_price_day_ago(1)
            console.log( `yesterday price ${_yesterday_price}`)
            setXrpPriceYesterday(_yesterday_price)
            await reloadAmmInfo()
        } catch (error) {
            console.error("Failed to load XRP price:", error);
        }
    }

    const reloadAmmInfo = async () => {
        try {
            const info = await xrp_api.get_amm_info();
            setAmmInfo(info);
        } catch (error) {
            console.error("Failed to reload AMM info:", error);
        }
    }
    return { xrpPrice, xrpPriceYesterday, ammInfo, init, reloadAmmInfo };
}