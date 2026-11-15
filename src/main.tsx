import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './lib/appUpdate';
import '@fontsource-variable/fredoka';
import '@fontsource-variable/lexend';
import '@fontsource-variable/cinzel';
import App from './App';
import './styles/app.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
