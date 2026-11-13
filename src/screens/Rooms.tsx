import { useStore } from '../store';
import { todayKey } from '../engine/dates';
import { stageIndex } from '../engine/creature';
import { balanceOf, gateStatus } from '../store/selectors';
import type { Screen } from '../App';

const ROOMS = [
  { id: 'art', name: 'Art studio', icon: '🎨', blurb: 'Paint, sketch, and design your own creature.', unlockStage: 'hatchling', ready: true },
  { id: 'music', name: 'Music corner', icon: '🎵', blurb: 'Warm up your voice, play ear games and record yourself singing over a backing track.', unlockStage: 'hatchling', ready: true },
  { id: 'chess', name: 'Chess with your creature', icon: '♟️', blurb: 'Your creature has been practising openings…', unlockStage: 'juvenile', ready: false },
  { id: 'runner', name: 'Sky runner', icon: '🏃', blurb: 'An endless dash across the rooftops of your world.', unlockStage: 'teen', ready: false },
] as const;

export function Rooms({ go }: { go: (s: Screen) => void }) {
  const s = useStore();
  const today = todayKey();
  const gate = gateStatus(s, today);
  const balance = balanceOf(s, today);
  const stageIdx = stageIndex(s.creature.stage);

  return (
    <div className="page">
      <div className="row between wrap">
        <h1>Rooms</h1>
        <span className="pill strong">{balance} min of play time</span>
      </div>
      {!gate.passed && (
        <div className="card hint-card">
          <strong>Rooms open after today's gate:</strong>
          <ul className="todo">{gate.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
      )}
      {gate.passed && balance <= 0 && (
        <div className="hint">
          <p><strong>No play time yet today.</strong> Play time is earned by finishing <em>all</em> the blocks you picked when you started today's session (that gives 15 minutes), then:</p>
          <ul className="todo"><li>+5 min for a bonus block</li><li>+5 min for each mistake you catch (up to 2)</li><li>+5 to +10 min for a strong recall quiz</li></ul>
          <p className="small">Tip: if you started with 3 blocks, finish all 3, even if you did extra subjects instead.</p>
        </div>
      )}
      <div className="rooms-grid">
        {ROOMS.map((r) => {
          const stageOk = stageIdx >= stageIndex(r.unlockStage);
          const open = r.ready && stageOk && gate.passed && balance > 0;
          return (
            <div key={r.id} className={`card room ${open ? 'open' : 'locked'}`}>
              <span className="room-icon" aria-hidden="true">{stageOk && r.ready ? r.icon : '🔒'}</span>
              <h2>{r.name}</h2>
              <p className="muted">{r.blurb}</p>
              {!r.ready ? <p className="small kicker">Coming in a later chapter of the story</p>
                : !stageOk ? <p className="small kicker">Opens when your egg hatches</p>
                  : <button className="btn primary" disabled={!open} onClick={() => go(r.id as Screen)}>Enter</button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
