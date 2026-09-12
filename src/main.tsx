import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SiteContentProvider } from './context/SiteContentContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SiteContentProvider>
      <App />
    </SiteContentProvider>
  </StrictMode>,
);
