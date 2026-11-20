import { useStore } from '../store';
import { todayKey } from '../engine/dates';
import { balanceOf, gateStatus } from '../store/selectors';
import type { Screen } from '../App';

export const ROOMS = [
  { id: 'art', name: 'Art studio', icon: '🎨', blurb: 'Paint, draw shapes, add words and design your own creature.' },
  { id: 'music', name: 'Music corner', icon: '🎵', blurb: 'Warm up your voice, play ear games and sing over a backing track.' },
  { id: 'chess', name: 'Chess with your creature', icon: '♟️', blurb: 'Play a real game of chess against your creature. Easy, Medium or Hard.' },
  { id: 'runner', name: 'Sky runner', icon: '🏃', blurb: 'Dash across the rooftops, jump the chimneys and grab the coins.' },
] as const;

/** The four rooms. Once today's blocks are done she picks one; the others open again tomorrow. */
export function RoomPicker({ go, compact }: { go: (s: Screen) => void; compact?: boolean }) {
  const s = useStore();
  const today = todayKey();
  const gate = gateStatus(s, today);
  const balance = balanceOf(s, today);
  const chosen = s.roomChoice?.[today];

  return (
    <div className={`rooms-grid ${compact ? 'compact' : ''}`}>
      {ROOMS.map((r) => {
        const notToday = !!chosen && chosen !== r.id;
        const open = gate.passed && balance > 0 && !notToday;
        return (
          <div key={r.id} className={`card room ${open ? 'open' : 'locked'} ${chosen === r.id ? 'chosen' : ''}`}>
            <span className="room-icon" aria-hidden="true">{gate.passed && !notToday ? r.icon : '🔒'}</span>
            <h2>{r.name}</h2>
            {!compact && <p className="muted">{r.blurb}</p>}
            {notToday ? <p className="small kicker">Opens again tomorrow</p>
              : <button className="btn primary" disabled={!open} onClick={() => {
                if (!chosen && !window.confirm(`Pick ${r.name} for today? You get one room a day.`)) return;
                s.chooseRoom(r.id);
                go(r.id as Screen);
              }}>{chosen ? 'Go back in' : gate.passed ? 'Pick this room' : 'Locked'}</button>}
          </div>
        );
      })}
    </div>
  );
}

export function Rooms({ go }: { go: (s: Screen) => void }) {
  const s = useStore();
  const today = todayKey();
  const gate = gateStatus(s, today);
  const balance = balanceOf(s, today);
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
          <strong>Finish today's study blocks and you get to pick any one room ({gate.blocksDone} done so far):</strong>
          <ul className="todo">{gate.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
      )}
      {gate.passed && !chosen && balance > 0 && (
        <div className="card hint-card"><strong>🎉 Blocks done! Pick any one room for today.</strong> <span className="muted">The others open again tomorrow.</span></div>
      )}
      {gate.passed && chosen && balance > 0 && (
        <div className="hint"><p>Today's room: <strong>{chosenName}</strong>. You can go back in while you still have play time. Pick any room tomorrow!</p></div>
      )}
      {gate.passed && balance <= 0 && (
        <div className="hint"><p><strong>Play time used up for today.</strong> A bonus block, a caught mistake or a strong recall quiz each add 5 more minutes.</p></div>
      )}
      <RoomPicker go={go} />
    </div>
  );
}
