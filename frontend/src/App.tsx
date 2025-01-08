// App.tsx
import React from 'react';
import { RecoilRoot } from 'recoil';
import ClientLoader from './InitLoader';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WalletComponent from './components/WalletComponent';

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <Routes>
          <Route path="/wallet" element={<WalletComponent />} />
          {/* Keep other routes */}
        </Routes>
        <ClientLoader />
      </BrowserRouter>
    </RecoilRoot>
  );
};

export default App;