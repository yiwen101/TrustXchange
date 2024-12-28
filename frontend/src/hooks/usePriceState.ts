// usePriceState.ts
import { atom, useRecoilState } from "recoil";
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

export const useXrpPriceState = () => {
    const [xrpPrice, setXrpPrice] = useRecoilState(xrpPriceState);
    const [xrpPriceYesterday, setXrpPriceYesterday] = useRecoilState(xrpPriceYesterdayState);
    const [ammInfo, setAmmInfo] = useRecoilState(xrpAMMState);
    
    const threadPool = useThreadPool(2); // Set desired concurrency limit

    // Mutex to ensure init is called only once
    const isInitialized = useRef(false);

    const delegateInitTasks = () => {
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
    };

    const init = () => {
        if (isInitialized.current) {
            return;
        }
        isInitialized.current = true;
        console.log("init");
        delegateInitTasks();
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

    return { xrpPrice, xrpPriceYesterday, ammInfo, init, reloadAmmInfo };
};