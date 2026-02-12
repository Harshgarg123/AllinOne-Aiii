import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ApiKeyProvider } from "./contexts/ApiKeyManager.tsx";
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApiKeyProvider>
      <App />
    </ApiKeyProvider>
      
    
  </StrictMode>
);
