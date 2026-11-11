import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { prettyDay, todayKey } from '../engine/dates';
import { dailySeries, notebook, paperSeries, trendDirection } from '../engine/trends';
import { chapterTitle, subjectById } from '../store/selectors';
import { TrendChart } from '../components/TrendChart';
import { MistakesTab } from './Insights';

type Tab = 'notes' | 'progress' | 'mistakes';

export function Notebook() {
  const [tab, setTab] = useState<Tab>('notes');
  return (
    <div className="page">
      <div className="row between wrap">
        <h1>My notebook</h1>
        <div className="tabs" role="tablist">
          {([['notes', 'My notes'], ['progress', 'Progress'], ['mistakes', 'Mistakes']] as [Tab, string][]).map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>
      </div>
      {tab === 'notes' && <Notes />}
      {tab === 'progress' && <Progress />}
      {tab === 'mistakes' && <MistakesTab />}
    </div>
  );
}

const RATING: Record<string, string> = { got: '✓ remembered', nearly: '~ nearly', missed: '✗ missed' };

/** Every block's takeaways, newest first: everything she has written stays here. */
function Notes() {
  const s = useStore();
  const all = useMemo(() => notebook(s), [s.blocks, s.takeaways]); // eslint-disable-line react-hooks/exhaustive-deps
  const [subject, setSubject] = useState('');
  const [q, setQ] = useState('');
  const subjects = [...new Set(all.map((b) => b.subjectId))];
  const needle = q.trim().toLowerCase();
  const shown = all.filter((b) => (!subject || b.subjectId === subject) &&
    (!needle || b.takeaways.some((t) => `${t.text} ${t.ownQuestion ?? ''} ${t.ownAnswer ?? ''}`.toLowerCase().includes(needle))));
  const byDay = shown.reduce<Record<string, typeof shown>>((acc, b) => { (acc[b.date] ??= []).push(b); return acc; }, {});
  const total = all.reduce((a, b) => a + b.takeaways.length, 0);

  if (!all.length) return <div className="card"><p className="muted">Your takeaways from every study block will be kept here, so you can look back at everything you've learnt.</p></div>;

  return (
    <div className="stack">
      <div className="card row wrap">
        <span className="muted">{total} takeaways from {all.length} study blocks</span>
        <select value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Filter by subject">
          <option value="">All subjects</option>
          {subjects.map((id) => <option key={id} value={id}>{subjectById(s, id)?.name ?? id}</option>)}
        </select>
        <input className="grow-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search my notes…" aria-label="Search notes" />
      </div>
      {!shown.length && <p className="muted">Nothing matches that search.</p>}
      {Object.entries(byDay).map(([date, blocks]) => (
        <section key={date} className="card note-day">
          <h3>{prettyDay(date)}</h3>
          {blocks.map((b) => {
            const sub = subjectById(s, b.subjectId);
            return (
              <article key={b.blockId} className="note-block" style={{ borderLeftColor: sub?.color }}>
                <p className="note-head"><strong>{sub?.name}</strong>{b.chapterId && <> · {chapterTitle(s, b.chapterId)}</>}<span className="muted small"> · {b.minutes} min{b.exerciseTypes.length ? ` · ${b.exerciseTypes.join(', ')}` : ''}</span></p>
                <ol>
                  {b.takeaways.map((t) => (
                    <li key={t.id}>
                      {t.text}
                      {t.ownQuestion && <span className="note-q">Q: {t.ownQuestion} <em>A: {t.ownAnswer}</em></span>}
                      {(t.lastRating || t.mastered) && <span className={`note-tag ${t.mastered ? 'mastered' : t.lastRating}`}>{t.mastered ? '★ mastered' : RATING[t.lastRating!]}</span>}
                    </li>
                  ))}
                </ol>
                {b.exerciseNote && <p className="muted small">Note: {b.exerciseNote}</p>}
              </article>
            );
          })}
        </section>
      ))}
    </div>
  );
}

const pct = (v: number) => `${Math.round(v * 100)}%`;
const ARROW = { up: '↗ going up', down: '↘ dipping', flat: '→ steady' } as const;

function Progress() {
  const s = useStore();
  const today = todayKey();
  const days = dailySeries(s, today, 28);
  const papers = paperSeries(s);
  const recalls = days.filter((d) => d.recall !== null).map((d) => d.recall!);
  const recallTrend = trendDirection(recalls);
  const paperTrend = trendDirection(papers.map((p) => p.pct));
  const studyDays = days.filter((d) => d.blocks > 0).length;
  const minutes = days.reduce((a, d) => a + d.minutes, 0);

  return (
    <div className="stack">
      <div className="stats">
        <div className="card stat"><span className="stat-num">{studyDays}</span><span>study days in 4 weeks</span></div>
        <div className="card stat"><span className="stat-num">{Math.round(minutes / 60 * 10) / 10}</span><span>hours studied in 4 weeks</span></div>
        <div className="card stat"><span className="stat-num">{recalls.length ? pct(recalls.reduce((a, b) => a + b, 0) / recalls.length) : '–'}</span><span>average recall score{recallTrend ? ` · ${ARROW[recallTrend]}` : ''}</span></div>
        <div className="card stat"><span className="stat-num">{papers.length ? pct(papers.at(-1)!.pct) : '–'}</span><span>latest test paper{paperTrend ? ` · ${ARROW[paperTrend]}` : ''}</span></div>
      </div>
      <div className="card">
        <TrendChart title="Recall quiz score, last 4 weeks" kind="line" max={1} format={pct}
          points={days.map((d) => ({ date: d.date, value: d.recall }))}
          empty="Your recall scores will appear here after your first quiz (the day after your first study block)." />
      </div>
      <div className="card">
        <TrendChart title="Test paper scores" kind="line" max={1} format={pct}
          points={papers.map((p) => ({ date: p.date, value: p.pct, tip: `${p.title} · ${p.score}/${p.marks} · ${prettyDay(p.date)}` }))}
          empty="Mark a worksheet or test paper and save your score to see it here." />
      </div>
      <div className="card">
        <TrendChart title="Minutes studied per day, last 4 weeks" kind="bar" format={(v) => `${Math.round(v)}`}
          points={days.map((d) => ({ date: d.date, value: d.minutes }))}
          empty="Finish a study block to start your chart." />
      </div>
    </div>
  );
}
