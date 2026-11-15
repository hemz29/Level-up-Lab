import { registerSW } from 'virtual:pwa-register';
import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { flush } from './sync';

/**
 * App updates: a new version installs in the background. It is applied
 * - straight away if it arrives in the first seconds after opening (nothing is in progress yet),
 * - when the app is hidden and no study block is running, or
 * - when the person presses the "Update" button.
 * It checks for a new version when the tab comes back into view and every 30 minutes while open.
 */
let waiting = false;
const listeners = new Set<(w: boolean) => void>();
const openedAt = Date.now();

const apply = () => { void flush().then(() => updateSW(true)); };

const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(_url, reg) {
    if (!reg) return;
    setInterval(() => { void reg.update(); }, 30 * 60 * 1000);
    // coming back to the tab is a good moment to look for a new version
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void reg.update(); });
  },
  onNeedRefresh() {
    const busy = !!useStore.getState().activeBlock;
    if (!busy && Date.now() - openedAt < 8000) { apply(); return; }
    waiting = true;
    listeners.forEach((l) => l(true));
    const onHide = () => {
      if (document.visibilityState === 'hidden' && !useStore.getState().activeBlock) {
        document.removeEventListener('visibilitychange', onHide);
        apply();
      }
    };
    document.addEventListener('visibilitychange', onHide);
  },
});

export function useUpdateAvailable(): [boolean, () => void] {
  const [w, setW] = useState(waiting);
  useEffect(() => { listeners.add(setW); return () => { listeners.delete(setW); }; }, []);
  return [w, apply];
}
