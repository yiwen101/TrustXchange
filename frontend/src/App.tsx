// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Wallet from './Pages/Wallet/WalletPage';
import Home from './Pages/Home/HomePage';
import WebsiteNavbar from './WebsiteNavbar';
import PoolPage from './Pages/Pool/PoolPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <WebsiteNavbar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/pool" element={<PoolPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;