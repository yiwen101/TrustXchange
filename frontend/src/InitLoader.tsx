import React, { useCallback, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import WebsiteNavbar from './WebsiteNavbar';
import Home from './Pages/Home/HomePage';
import Wallet from './Pages/Wallet/WalletPage';
import PoolPage from './Pages/Pool/PoolPage';
import P2pPage from './Pages/P2P/P2pPage';
import SwapPage from './Pages/Swap/SwapPage';
import FuturePage from './Pages/Future/FuturePage';
import { useXrpPriceState} from './hooks/usePriceState';
import Dev from './Dev';
import PledgePage from './Pages/Pledge/PledgePage';



const InitLoader = () => {
    const { init} = useXrpPriceState(); 
    const _init = useCallback(async () => {
      await init()
    }, []);

    useEffect(() => {
      _init();
    }, []);
    return (
        <Box display="flex" flexDirection="column" height="calc(100vh - 65px)" width="100vw" maxWidth="100%">
          <WebsiteNavbar />
          <Box flex="1" display="flex" flexDirection="column" width="100%" height="calc(100vh - 65px)">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/pool" element={<PoolPage />} />
              <Route path="//pledge" element={<PledgePage />} />
              <Route path="/future" element={<FuturePage />} />
              <Route path="/dev" element={<Dev />} />
              <Route path="/p2p" element={<P2pPage />} />
              <Route path="/swap" element={<SwapPage />} />
            </Routes>
          </Box>
        </Box>
    )
}
export default InitLoader;