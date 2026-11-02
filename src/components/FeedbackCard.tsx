import { useState } from 'react';
import { useStore } from '../store';
import { todayKey, weekStart } from '../engine/dates';
import { submitFeedback } from '../lib/cloud';
import { useAccount } from '../lib/account';

const FACES = [
  { rating: 1, face: '😞', label: 'Not really' },
  { rating: 2, face: '😐', label: 'A little' },
  { rating: 3, face: '🙂', label: 'Yes' },
  { rating: 4, face: '😄', label: 'A lot' },
];

/** Once a week, after a few sessions: a one-tap answer for the Level-Up Lab team. */
export function FeedbackCard() {
  const s = useStore();
  const account = useAccount();
  const week = weekStart(todayKey());
  const [rating, setRating] = useState<number>();
  const [comment, setComment] = useState('');
  const [state, setState] = useState<'ask' | 'sending' | 'thanks'>('ask');
  const sessions = Object.values(s.sessions).filter((x) => x.blockIds.length > 0).length;

  if (account.mode !== 'cloud' || sessions < 3 || (s.feedbackWeeks ?? []).includes(week) && state !== 'thanks') return null;
  if (state === 'thanks') return <div className="card"><p>Thank you! That really helps us make Level-Up Lab better. 💛</p></div>;

  return (
    <div className="card">
      <h3>Is Level-Up Lab helping you study?</h3>
      <div className="row wrap">
        {FACES.map((f) => (
          <button key={f.rating} className={`chip face ${rating === f.rating ? 'on' : ''}`} onClick={() => setRating(f.rating)} aria-label={f.label}>
            <span aria-hidden="true">{f.face}</span> {f.label}
          </button>
        ))}
      </div>
      {rating && (
        <div className="stack">
          <input maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Anything to tell us? (optional, the Level-Up Lab team reads this)" />
          <div className="row">
            <button className="btn primary small" disabled={state === 'sending'} onClick={async () => {
              setState('sending');
              try { await submitFeedback(account.childId, week, rating, comment.trim()); } catch { /* offline: still don't nag again this week */ }
              s.markFeedback(week);
              setState('thanks');
            }}>Send</button>
            <button className="btn ghost small" onClick={() => { s.markFeedback(week); }}>Not now</button>
          </div>
        </div>
      )}
    </div>
  );
}
