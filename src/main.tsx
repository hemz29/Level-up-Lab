import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import '@fontsource-variable/fredoka';
import '@fontsource-variable/lexend';
import '@fontsource-variable/cinzel';
import App from './App';
import { useStore } from './store';
import { flush } from './lib/sync';
import './styles/app.css';

// A new version waits until the app is in the background with no study block running,
// so an update never interrupts a child mid-setup or mid-block.
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    const apply = () => {
      if (document.visibilityState === 'hidden' && !useStore.getState().activeBlock) {
        document.removeEventListener('visibilitychange', apply);
        void flush().then(() => updateSW(true));
      }
    };
    document.addEventListener('visibilitychange', apply);
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
