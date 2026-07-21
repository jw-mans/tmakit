import './tma-mock.ts'; // MUST be first: installs the mock before the SDK runs.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { on, postEvent } from '@telegram-apps/bridge';
import { TmaProvider } from 'tma-kit';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TmaProvider bridge={{ on, postEvent }}>
      <App />
    </TmaProvider>
  </StrictMode>,
);
