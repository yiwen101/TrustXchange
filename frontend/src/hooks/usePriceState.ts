// usePriceState.ts
import { atom,  useRecoilValue, useSetRecoilState } from "recoil";
import { useRef } from "react";
import xrp_api from "../api/xrp";
import { AMMInfo } from "../api/xrp/amm_transection";
import { useThreadPool } from '../utils';

const xrpPriceState = atom({
    key: "XRP_PRICE",
    default: null as number | null,
});

const xrpPriceYesterdayState = atom({
    key: "XRP_PRICE_YESTERDAY",
    default: null as number | null,
});

const xrpAMMState = atom({
    key: "XRP_AMM_INFO",
    default: null as AMMInfo | null,
});

export const useXrpPriceValue= () => {
    const xrpPrice = useRecoilValue(xrpPriceState);
    const ammInfo = useRecoilValue(xrpAMMState);
    const xrpPriceYesterday = useRecoilValue(xrpPriceYesterdayState);
    return { xrpPrice, ammInfo , xrpPriceYesterday};
}

export const useXrpPriceState = () => {
    const setXrpPrice = useSetRecoilState(xrpPriceState);
    const setXrpPriceYesterday = useSetRecoilState(xrpPriceYesterdayState);
    const setAmmInfo = useSetRecoilState(xrpAMMState);
    
    const threadPool = useThreadPool(8);
    // Mutex to ensure init is called only once
    const isInitialized = useRef(false);
    

    const delegateInitTasks = async () => {
        threadPool.run(async () => {
            console.log("Task1");
            const _latest_price = await xrp_api.get_xrp_price_at_ledger();
            console.log(`latest price ${_latest_price}`);
            setXrpPrice(_latest_price!);
            console.log("Task1 finished");
        });

        threadPool.run(async () => {
            console.log("Task2");
            const _yesterday_price = await xrp_api.get_xrp_price_day_ago(1);
            console.log(`yesterday price ${_yesterday_price}`);
            setXrpPriceYesterday(_yesterday_price);
            console.log("Task2 finished");
        });

        threadPool.run(async () => {
            console.log("Task3");
            await reloadAmmInfo();
            console.log("Task3 finished");
        });
        threadPool.run(async () => {
            console.log("Task4");
            const reload = await xrp_api.even_out_amm()
            if (reload) {
            console.log("reload")
            await reloadAmmInfo()
            }
            console.log("Task4 finished");
        })
        await threadPool.finish_all()
    };

    const init = async () => {
        if (isInitialized.current) {
            return;
        }
        isInitialized.current = true;
        console.log("init");
        await delegateInitTasks();
    };

    const reloadAmmInfo = async () => {
        try {
            const info = await xrp_api.get_amm_info();
            console.log(`AMM Info`, info);
            setAmmInfo(info);
        } catch (error) {
            console.error("Failed to reload AMM info:", error);
        }
    };

    return { init, reloadAmmInfo };
};