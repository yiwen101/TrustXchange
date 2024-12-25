// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Wallet from './WalletPage';
import Home from './HomePage';
import WebsiteNavbar from './WebsiteNavbar';
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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;