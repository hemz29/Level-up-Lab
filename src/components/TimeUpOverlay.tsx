import { Bubble } from './Bubble';
import { lines } from '../lib/voice';
import type { Screen } from '../App';

export function TimeUpOverlay({ go }: { go: (s: Screen) => void }) {
  return (
    <div className="overlay">
      <div className="modal center">
        <Bubble>{lines.timeUp}</Bubble>
        <button className="btn primary" onClick={() => go('home')}>Back home</button>
      </div>
    </div>
  );
}
