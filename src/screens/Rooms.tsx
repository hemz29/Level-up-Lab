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
  const chosen = s.roomChoice?.[today];
  const chosenName = ROOMS.find((r) => r.id === chosen)?.name;

  return (
    <div className="page">
      <div className="row between wrap">
        <h1>Rooms</h1>
        <span className="pill strong">{balance} min of play time</span>
      </div>
      {!gate.passed && (
        <div className="card hint-card">
          <strong>Finish {gate.blocksDone === 0 ? 'your' : 'the rest of your'} study blocks and you get to pick one room for today ({gate.blocksDone} done so far):</strong>
          <ul className="todo">{gate.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
      )}
      {gate.passed && !chosen && balance > 0 && (
        <div className="card hint-card"><strong>🎉 Blocks done! Pick any one room for today.</strong> <span className="muted">The others open again tomorrow.</span></div>
      )}
      {gate.passed && chosen && (
        <div className="hint"><p>Today's room: <strong>{chosenName}</strong>. You can go back in while you still have play time. Pick a different room tomorrow!</p></div>
      )}
      {gate.passed && balance <= 0 && (
        <div className="hint"><p><strong>Play time used up for today.</strong> A bonus block, a caught mistake or a strong recall quiz each add 5 more minutes.</p></div>
      )}
      <div className="rooms-grid">
        {ROOMS.map((r) => {
          const stageOk = stageIdx >= stageIndex(r.unlockStage);
          const notToday = !!chosen && chosen !== r.id;
          const open = r.ready && stageOk && gate.passed && balance > 0 && !notToday;
          return (
            <div key={r.id} className={`card room ${open ? 'open' : 'locked'}`}>
              <span className="room-icon" aria-hidden="true">{stageOk && r.ready ? r.icon : '🔒'}</span>
              <h2>{r.name}</h2>
              <p className="muted">{r.blurb}</p>
              {!r.ready ? <p className="small kicker">Coming in a later chapter of the story</p>
                : !stageOk ? <p className="small kicker">Opens when your egg hatches</p>
                  : notToday ? <p className="small kicker">Opens again tomorrow</p>
                    : <button className="btn primary" disabled={!open} onClick={() => {
                      if (!chosen && !window.confirm(`Pick the ${r.name} for today? You get one room a day.`)) return;
                      s.chooseRoom(r.id);
                      go(r.id as Screen);
                    }}>{chosen ? 'Go back in' : 'Pick this room'}</button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
