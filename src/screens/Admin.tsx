import { useEffect, useState } from 'react';
import { config } from '../config';
import { fetchAdmin, type AdminChild, type AdminFamily } from '../lib/cloud';

const FEEDBACK = ['', '😞', '😐', '🙂', '😄'];
const pct = (v: number | null | undefined) => (v === null || v === undefined ? '–' : `${Math.round(v * 100)}%`);
const day = (d: string | null) => (d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '–');

function activity(c: AdminChild): { label: string; cls: string } {
  const d = c.stats?.studyDays7 ?? 0;
  if (d >= 4) return { label: 'Regular', cls: 'good' };
  if (d >= 1) return { label: 'Some', cls: 'mid' };
  return { label: 'Not this week', cls: 'none' };
}

/** Usage and progress numbers only. Children's notes, takeaways and drawings are never sent here. */
export function Admin({ onBack }: { onBack: () => void }) {
  const [families, setFamilies] = useState<AdminFamily[] | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => { fetchAdmin().then((r) => setFamilies(r.families)).catch((e) => setErr(e.message)); }, []);

  if (err) return <div className="page"><div className="card narrow"><p className="error">{err}</p><button className="btn" onClick={onBack}>Back</button></div></div>;
  if (!families) return <div className="page"><p className="muted">Loading…</p></div>;

  const kids = families.flatMap((f) => f.children.map((c) => ({ ...c, parentEmail: f.parentEmail })));
  const active = kids.filter((k) => (k.stats?.studyDays7 ?? 0) > 0);
  const avgDays = active.length ? (active.reduce((a, k) => a + (k.stats?.studyDays7 ?? 0), 0) / active.length).toFixed(1) : '–';
  const ratings = kids.flatMap((k) => k.feedback.slice(0, 1).map((f) => f.rating));
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
  const improving = kids.filter((k) => k.stats && k.stats.recallGotRateFirstWeek !== null && k.stats.recallGotRateLast7 !== null && k.stats.recallGotRateLast7 > k.stats.recallGotRateFirstWeek).length;
  const catLabel = (id: string) => config.mistakeCategories.find((c) => c.id === id)?.label ?? id;
  const comments = kids.flatMap((k) => k.feedback.filter((f) => f.comment).map((f) => ({ ...f, nickname: k.nickname })));

  return (
    <div className="page">
      <div className="row between wrap">
        <h1>Admin dashboard</h1>
        <button className="btn" onClick={onBack}>Back</button>
      </div>
      <p className="muted small">Numbers only. Children's notes, takeaways and drawings stay private to their family.</p>
      <div className="stats">
        <div className="card stat"><span className="stat-num">{families.length}</span><span>families signed up</span></div>
        <div className="card stat"><span className="stat-num">{kids.length}</span><span>children</span></div>
        <div className="card stat"><span className="stat-num">{active.length}</span><span>studied in the last 7 days</span></div>
        <div className="card stat"><span className="stat-num">{avgDays}</span><span>avg study days/week (active kids)</span></div>
        <div className="card stat"><span className="stat-num">{improving}</span><span>kids whose recall is improving</span></div>
        <div className="card stat"><span className="stat-num">{avgRating ? FEEDBACK[Math.round(avgRating)] : '–'}</span><span>latest "is it helping?" ({ratings.length} answers)</span></div>
      </div>

      <div className="card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Child</th><th>Parent</th><th>Joined</th><th>Last studied</th><th>This week</th><th>Days 7 / 30</th>
              <th>Minutes (7d / total)</th><th>Blocks</th><th>Consistency</th><th>Recall: 1st week → now</th>
              <th>Mistakes caught</th><th>Test papers (avg)</th><th>Creature</th><th>Reports</th><th>Helping?</th>
            </tr>
          </thead>
          <tbody>
            {kids.map((k) => {
              const s = k.stats;
              const a = activity(k);
              const top = s ? Object.entries(s.mistakesByCategory).sort((x, y) => y[1] - x[1])[0] : undefined;
              const fb = k.feedback[0];
              return (
                <tr key={k.id}>
                  <td><strong>{k.nickname}</strong></td>
                  <td className="small">{k.parentEmail}</td>
                  <td>{day(k.createdAt)}</td>
                  <td>{day(k.lastActive)}</td>
                  <td><span className={`badge ${a.cls}`}>{a.label}</span></td>
                  <td>{s ? `${s.studyDays7} / ${s.studyDays30}` : '–'}</td>
                  <td>{s ? `${s.minutes7} / ${s.totalMinutes}` : '–'}</td>
                  <td>{s?.totalBlocks ?? '–'}</td>
                  <td>{s ? `${s.consistencyActive} of 7` : '–'}</td>
                  <td>{s ? `${pct(s.recallGotRateFirstWeek)} → ${pct(s.recallGotRateLast7)}` : '–'}</td>
                  <td>{s ? `${s.mistakesCaught}${top ? ` (mostly ${catLabel(top[0]).toLowerCase()})` : ''}` : '–'}</td>
                  <td>{s?.papersCreated ? `${s.papersCreated}${s.avgPaperScore !== null && s.avgPaperScore !== undefined ? ` (${pct(s.avgPaperScore)})` : ''}` : '–'}</td>
                  <td>{s ? `${config.stages.find((x) => x.id === s.stage)?.name ?? s.stage}, ${s.gp} GP` : '–'}</td>
                  <td>{s?.reportsSent ?? '–'}</td>
                  <td>{fb ? `${FEEDBACK[fb.rating]} ${day(fb.weekStart)}` : '–'}</td>
                </tr>
              );
            })}
            {!kids.length && <tr><td colSpan={15} className="muted">No children yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Feedback comments</h2>
        <p className="muted small">Written by children for the Level-Up Lab team, in answer to "Is Level-Up Lab helping you study?"</p>
        {!comments.length && <p className="muted">No comments yet.</p>}
        <ul className="case-list">
          {comments.map((c, i) => <li key={i}><span className="muted small">{c.nickname} · week of {day(c.weekStart)} · {FEEDBACK[c.rating]}</span><span>{c.comment}</span></li>)}
        </ul>
      </div>

      <div className="card">
        <h2>Families without children yet</h2>
        <ul>{families.filter((f) => !f.children.length).map((f) => <li key={f.parentEmail}>{f.parentEmail} · signed up {day(f.signedUpAt)}</li>)}</ul>
      </div>
    </div>
  );
}
