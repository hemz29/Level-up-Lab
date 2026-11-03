import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { BANKS, banksBySubject } from '../data/questions';
import { generatePaper, newSeed, paperSpecMarks, paperSpecs, type Paper } from '../engine/worksheet';
import { PaperView } from '../components/PaperView';
import { hashPin } from '../lib/pin';
import { play } from '../lib/sound';
import type { SavedPaper } from '../types';

const ICONS: Record<string, string> = { practice: '✏️', 'unit-test': '📝', 'half-yearly': '📚', annual: '🏆' };
const BLURB: Record<string, string> = {
  practice: 'A short mixed sheet for revision at home.',
  'unit-test': 'Same layout and marks as a school unit test.',
  'half-yearly': 'Full exam paper in the school format.',
  annual: 'Full exam paper in the school format.',
};

export function Worksheets() {
  const s = useStore();
  const specs = paperSpecs();
  const subjects = banksBySubject();
  const [specId, setSpecId] = useState('unit-test');
  const [subjectId, setSubjectId] = useState(subjects[0]?.subjectId);
  const [bankIds, setBankIds] = useState<string[]>(() => subjects[0]?.banks.map((b) => b.id) ?? []);
  const [open, setOpen] = useState<SavedPaper | null>(null);

  const subject = subjects.find((x) => x.subjectId === subjectId);
  const spec = specs.find((x) => x.id === specId)!;

  if (open) return <PaperScreen saved={open} onBack={() => setOpen(null)} onNew={(p) => setOpen(p)} />;

  const create = () => {
    const seed = newSeed();
    const banks = BANKS.filter((b) => bankIds.includes(b.id));
    const paper = generatePaper(spec, banks, seed);
    const id = s.savePaper({ specId, title: paper.title, subject: paper.subject, bankIds, seed, marks: paper.marks });
    play('unlock');
    setOpen({ id, specId, title: paper.title, subject: paper.subject, bankIds, seed, marks: paper.marks, createdAt: new Date().toISOString() });
  };

  return (
    <div className="page">
      <div className="row between wrap">
        <h1>Worksheets & test papers</h1>
      </div>
      <p className="muted">Every question comes from your own textbook chapters, in your school's paper format. Print it, write it like a real test, then check your answers.</p>

      <div className="card">
        <h2>1. What kind of paper?</h2>
        <div className="paper-types">
          {specs.map((p) => (
            <button key={p.id} className={`paper-type ${specId === p.id ? 'on' : ''}`} onClick={() => setSpecId(p.id)} aria-pressed={specId === p.id}>
              <span className="paper-type-icon" aria-hidden="true">{ICONS[p.id] ?? '📄'}</span>
              <strong>{p.title}</strong>
              <span className="small">{paperSpecMarks(p)} marks{p.minutes ? ` · ${p.minutes} min` : ''}</span>
              <span className="small muted">{BLURB[p.id] ?? ''}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>2. Which chapters?</h2>
        {subjects.length > 1 && (
          <div className="tabs">
            {subjects.map((x) => (
              <button key={x.subjectId} className={subjectId === x.subjectId ? 'on' : ''} onClick={() => { setSubjectId(x.subjectId); setBankIds(x.banks.map((b) => b.id)); }}>{x.subject}</button>
            ))}
          </div>
        )}
        <p className="kicker">{subject?.subject}</p>
        <div className="stack">
          {subject?.banks.map((b) => (
            <label key={b.id} className="switch">
              <input type="checkbox" checked={bankIds.includes(b.id)} onChange={(e) => setBankIds(e.target.checked ? [...bankIds, b.id] : bankIds.filter((x) => x !== b.id))} />
              {b.chapter} <span className="muted small">(textbook pp. {b.pages})</span>
            </label>
          ))}
        </div>
        <p className="muted small">More chapters appear here as their textbook pages are added.</p>
      </div>

      <div className="card row wrap">
        <label className="field inline grow"><span>School name on the paper (optional)</span>
          <input defaultValue={s.settings.schoolName ?? ''} maxLength={60} onBlur={(e) => s.setSchoolName(e.target.value.trim())} placeholder="e.g. your school's name" />
        </label>
        <button className="btn primary big" disabled={!bankIds.length} onClick={create}>Create {spec.title.toLowerCase()}</button>
      </div>

      {(s.papers ?? []).length > 0 && (
        <div className="card">
          <h2>My papers</h2>
          <ul className="paper-list">
            {(s.papers ?? []).map((p) => (
              <li key={p.id}>
                <button className="link-btn" onClick={() => setOpen(p)}>
                  <strong>{p.title}</strong> · {p.subject} · {new Date(p.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                </button>
                <span className={`pill ${typeof p.score === 'number' ? 'strong' : ''}`}>{typeof p.score === 'number' ? `${p.score} / ${p.marks}` : `${p.marks} marks · not marked yet`}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function PaperScreen({ saved, onBack, onNew }: { saved: SavedPaper; onBack: () => void; onNew: (p: SavedPaper) => void }) {
  const s = useStore();
  const spec = paperSpecs().find((x) => x.id === saved.specId)!;
  const banks = BANKS.filter((b) => saved.bankIds.includes(b.id));
  const paper: Paper = useMemo(() => generatePaper(spec, banks, saved.seed), [saved.seed, saved.specId, saved.bankIds.join()]); // eslint-disable-line react-hooks/exhaustive-deps
  const current = (s.papers ?? []).find((p) => p.id === saved.id) ?? saved;
  const [showKey, setShowKey] = useState(false);
  const [pinAsk, setPinAsk] = useState(false);
  const [pin, setPin] = useState('');
  const [pinErr, setPinErr] = useState('');
  const [space, setSpace] = useState(paper.answerSpace);
  const [score, setScore] = useState(current.score?.toString() ?? '');

  const openKey = () => { if (s.settings.parentPinHash) setPinAsk(true); else setShowKey(true); };

  return (
    <div className="paper-screen">
      <div className="paper-toolbar no-print">
        <button className="btn ghost" onClick={onBack}>← Back</button>
        <div className="row wrap">
          {!showKey && <label className="switch small"><input type="checkbox" checked={space} onChange={(e) => setSpace(e.target.checked)} /> Space for answers</label>}
          <button className="btn" onClick={() => window.print()}>🖨️ Print / save PDF</button>
          <button className="btn" onClick={() => {
            const seed = newSeed();
            const p = generatePaper(spec, banks, seed);
            const id = s.savePaper({ specId: saved.specId, title: p.title, subject: p.subject, bankIds: saved.bankIds, seed, marks: p.marks });
            onNew({ ...saved, id, seed, marks: p.marks, score: undefined, createdAt: new Date().toISOString() });
          }}>New version</button>
          {showKey ? <button className="btn" onClick={() => setShowKey(false)}>Hide answers</button> : <button className="btn" onClick={openKey}>Answer key</button>}
        </div>
      </div>

      {pinAsk && (
        <form className="card narrow no-print stack" onSubmit={async (e) => {
          e.preventDefault();
          if ((await hashPin(pin)) === s.settings.parentPinHash) { setShowKey(true); setPinAsk(false); setPin(''); setPinErr(''); }
          else setPinErr('That PIN is not right.');
        }}>
          <strong>Answer key: grown-ups only</strong>
          <p className="muted small">Mark the paper with a grown-up, or write it first and then check.</p>
          <div className="row"><input type="password" inputMode="numeric" autoFocus placeholder="Parent PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
            <button className="btn primary">Show answers</button><button type="button" className="btn ghost" onClick={() => setPinAsk(false)}>Cancel</button></div>
          {pinErr && <p className="error">{pinErr}</p>}
        </form>
      )}

      {paper.warnings.length > 0 && <div className="hint no-print">{paper.warnings.map((w) => <p key={w}>{w}</p>)}</div>}

      <PaperView paper={paper} schoolName={s.settings.schoolName} answerKey={showKey} answerSpace={space} />

      <form className="card narrow no-print row wrap score-box" onSubmit={(e) => {
        e.preventDefault();
        const n = Number(score);
        if (score === '' || Number.isNaN(n) || n < 0 || n > paper.marks) return;
        s.setPaperScore(saved.id, n);
        play(n / paper.marks >= 0.8 ? 'sparkle' : 'accept');
      }}>
        <span>After marking, my score:</span>
        <input inputMode="decimal" value={score} onChange={(e) => setScore(e.target.value)} aria-label="Score" className="score-input" /> <span>/ {paper.marks}</span>
        <button className="btn primary small">Save score</button>
        {typeof current.score === 'number' && <span className="pill strong">Saved: {current.score} / {paper.marks} ({Math.round((current.score / paper.marks) * 100)}%)</span>}
      </form>
    </div>
  );
}
