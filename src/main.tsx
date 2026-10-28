import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { LeadsProvider } from '@/lib/leadsContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LeadsProvider>
      <App />
    </LeadsProvider>
  </StrictMode>
);
