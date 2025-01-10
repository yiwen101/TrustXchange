// App.tsx
import React from 'react';
import { RecoilRoot } from 'recoil';
import ClientLoader from './InitLoader';
import { BrowserRouter} from 'react-router-dom';

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <ClientLoader />
      </BrowserRouter>
    </RecoilRoot>
  );
};

export default App;