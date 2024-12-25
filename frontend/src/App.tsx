// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import WebsiteNavbar from './WebsiteNavbar';
import Home from './Pages/Home/HomePage';
import Wallet from './Pages/Wallet/WalletPage';
import PoolPage from './Pages/Pool/PoolPage';
import Temp from './Pages/Temp';
import P2pPage from './Pages/P2P/P2pPage';

const App: React.FC = () => {
  return (
      <Router>
        <div className="App">
        <WebsiteNavbar />
        <Box flex="1" display="flex" flexDirection="column">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/pool" element={<PoolPage />} />
            <Route path="/temp" element={<Temp />} />
            <Route path="/p2p" element={<P2pPage />} />
          </Routes>
        </Box>
        </div>
      </Router>
  );
};

export default App;