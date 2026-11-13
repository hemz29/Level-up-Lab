import { useEffect, useState } from 'react';
import type { Exam, Subject, SubjectKind } from '../types';
import { useStore } from '../store';
import { parsePortions } from '../engine/curriculum';
import { prettyDay, todayKey } from '../engine/dates';
import { TEMPLATES } from '../data/templates';

const KINDS: { id: SubjectKind; label: string }[] = [
  { id: 'maths', label: 'Maths (a little practice every day)' },
  { id: 'memory', label: 'Memory-heavy (History, Geography, Biology…)' },
  { id: 'science', label: 'Science' },
  { id: 'language', label: 'Language' },
  { id: 'other', label: 'Other' },
];

/** Text typed but not yet added survives reloads and interruptions. */
function useDraft(key: string): [string, (v: string) => void] {
  const [v, setV] = useState(() => { try { return localStorage.getItem(key) ?? ''; } catch { return ''; } });
  useEffect(() => { try { if (v) localStorage.setItem(key, v); else localStorage.removeItem(key); } catch { /* private mode */ } }, [key, v]);
  return [v, setV];
}

/**
 * Each family sets up its own subjects, chapters (typed, pasted or uploaded) and exams.
 * Every change saves straight away, so an interrupted session loses nothing.
 */
export function CurriculumEditor() {
  const s = useStore();
  const [open, setOpen] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useDraft('draft:newSubject');

  return (
    <div className="stack">
      <Exams />

      <div className="card stack">
        <div className="row between wrap">
          <h2>Subjects and chapters</h2>
          <span className="muted small">{s.subjects.length} subject{s.subjects.length === 1 ? '' : 's'} · {s.subjects.reduce((a, x) => a + x.chapters.length, 0)} chapters · saved automatically</span>
        </div>
        <p className="muted small">Add your own subjects, then type, paste or upload each one's chapters (for example, the portions list from the school). New chapters are marked "In portion".</p>

        {s.subjects.map((sub) => (
          <SubjectEditor key={sub.id} sub={sub} open={open === sub.id} onToggle={() => setOpen(open === sub.id ? null : sub.id)} />
        ))}
        {!s.subjects.length && <p className="hint">No subjects yet. Add the first one below.</p>}

        <form className="row wrap" onSubmit={(e) => {
          e.preventDefault();
          const name = newSubject.trim();
          if (!name) return;
          const id = s.addSubject(name);
          setNewSubject('');
          setOpen(id);
        }}>
          <input className="grow-input" maxLength={40} value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="New subject, e.g. Kannada" aria-label="New subject name" />
          <button className="btn primary" disabled={!newSubject.trim()}>Add subject</button>
        </form>
      </div>

      <div className="card stack">
        <h3>Start from a list</h3>
        {TEMPLATES.map((t) => (
          <div key={t.id} className="row wrap between">
            <span><strong>{t.name}</strong><br /><span className="muted small">{t.subjects.map((x) => x.name).join(' · ')}</span></span>
            <button className="btn small" onClick={() => { if (confirm(`Replace all subjects and chapters with "${t.name}"?`)) s.loadTemplate(t.id); }}>Use this list</button>
          </div>
        ))}
        <div className="row wrap between">
          <span><strong>Empty list</strong><br /><span className="muted small">Remove every subject and build your own from scratch. Study history is kept.</span></span>
          <button className="btn small ghost" onClick={() => { if (confirm('Remove all subjects, chapters and exams? Logged study history is kept.')) s.clearAllSubjects(); }}>Start empty</button>
        </div>
      </div>
    </div>
  );
}

function SubjectEditor({ sub, open, onToggle }: { sub: Subject; open: boolean; onToggle: () => void }) {
  const s = useStore();
  const [paste, setPaste] = useDraft(`draft:portions:${sub.id}`);
  const [newChapter, setNewChapter] = useDraft(`draft:chapter:${sub.id}`);
  const parsed = paste.trim() ? parsePortions(paste) : null;
  const inPortion = sub.chapters.filter((c) => c.portionStatus !== 'out').length;

  return (
    <div className="subject-edit" style={{ borderLeft: `5px solid ${sub.color}`, paddingLeft: 12 }}>
      <button className="subject-head" aria-expanded={open} onClick={onToggle}>
        <span className="subject-name">{sub.name || 'Untitled subject'}</span>
        <span className="muted small">{sub.chapters.length} chapters · {inPortion} in portion{sub.testDate ? ` · test ${prettyDay(sub.testDate)}` : ''}</span>
        <span aria-hidden="true">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="stack">
          <div className="row wrap">
            <label className="field inline"><span>Name</span>
              <input value={sub.name} maxLength={40} onChange={(e) => s.renameSubject(sub.id, e.target.value)} />
            </label>
            <label className="field inline"><span>Type</span>
              <select value={sub.kind} onChange={(e) => s.setSubjectKind(sub.id, e.target.value as SubjectKind)}>
                {KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
              </select>
            </label>
            <button className="btn ghost small" onClick={() => { if (confirm(`Remove ${sub.name} and its chapters? Logged study history is kept.`)) s.deleteSubject(sub.id); }}>Remove subject</button>
          </div>

          <div className="paste-box">
            <strong>Paste or upload the portions</strong>
            <p className="muted small">One chapter per line, or separated by commas. Numbers like "1." or "Ch 3 –" are tidied up, and lines like "Revision" or "Unit test" are skipped.</p>
            <textarea rows={4} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={'e.g.\n1. South America\nCh 5 - Minerals\nRevision of Test 1'} aria-label={`Portions for ${sub.name}`} />
            <div className="row wrap">
              <label className="btn small">Upload a .txt or .csv file
                <input type="file" accept=".txt,.csv,text/plain,text/csv" hidden onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) setPaste((await f.text()).slice(0, 20000));
                  e.target.value = '';
                }} />
              </label>
              {parsed && <span className="muted small">{parsed.chapters.length} chapters found{parsed.skipped.length ? `, ${parsed.skipped.length} lines skipped` : ''}</span>}
            </div>
            {parsed && parsed.chapters.length > 0 && (
              <>
                <ol className="parsed-list">{parsed.chapters.map((c) => <li key={c}>{c}</li>)}</ol>
                {parsed.skipped.length > 0 && <p className="muted small">Skipped: {parsed.skipped.join(' · ')}</p>}
                <div className="row wrap">
                  <button className="btn primary small" onClick={() => { s.addChapters(sub.id, parsed.chapters, 'append'); setPaste(''); }}>Add these chapters</button>
                  {sub.chapters.length > 0 && (
                    <button className="btn small" onClick={() => {
                      if (!confirm(`Replace ${sub.name}'s chapters with these ${parsed.chapters.length}? Chapters already studied are kept but marked not in portion.`)) return;
                      s.addChapters(sub.id, parsed.chapters, 'replace'); setPaste('');
                    }}>Replace the current chapters</button>
                  )}
                </div>
              </>
            )}
          </div>

          {sub.chapters.length > 0 && (
            <div className="stack">
              <strong>Chapters</strong>
              {sub.chapters.map((c) => (
                <div key={c.id} className="row chapter-edit">
                  <span className="muted">{c.number}.</span>
                  <input value={c.title} maxLength={120} onChange={(e) => s.updateChapter(sub.id, c.id, { title: e.target.value })} aria-label={`Chapter ${c.number} title`} />
                  <select value={c.portionStatus} onChange={(e) => s.setPortion(c.id, e.target.value as typeof c.portionStatus)} aria-label="Portion status">
                    <option value="in">In portion</option><option value="probably">Probably</option><option value="out">Not in portion</option>
                  </select>
                  <label className="small"><input type="checkbox" checked={c.weight > 1} onChange={(e) => s.updateChapter(sub.id, c.id, { weight: e.target.checked ? 2 : 1 })} /> long</label>
                  <button className="btn ghost small" aria-label={`Remove ${c.title}`} onClick={() => { if (confirm(`Remove "${c.title}"?`)) s.deleteChapter(sub.id, c.id); }}>✕</button>
                </div>
              ))}
            </div>
          )}
          <form className="row" onSubmit={(e) => {
            e.preventDefault();
            if (!newChapter.trim()) return;
            s.addChapters(sub.id, [newChapter.trim()], 'append');
            setNewChapter('');
          }}>
            <input className="grow-input" maxLength={120} value={newChapter} onChange={(e) => setNewChapter(e.target.value)} placeholder="Add one chapter…" aria-label="New chapter" />
            <button className="btn small" disabled={!newChapter.trim()}>Add</button>
          </form>
        </div>
      )}
    </div>
  );
}

function Exams() {
  const s = useStore();
  const today = todayKey();
  const exams = [...(s.exams ?? [])].sort((a, b) => (a.date < b.date ? -1 : 1));
  const [name, setName] = useDraft('draft:examName');
  const [date, setDate] = useDraft('draft:examDate');

  return (
    <div className="card stack">
      <h2>Exams and test dates</h2>
      <p className="muted small">Add each test the school announces. The plan counts down to the next one, and light days change in exam week.</p>
      {exams.map((e) => <ExamRow key={e.id} exam={e} past={e.date < today} />)}
      {!exams.length && <p className="muted">No exams yet. Until there's one, the plan works a week at a time.</p>}
      <form className="row wrap" onSubmit={(ev) => {
        ev.preventDefault();
        if (!name.trim() || !date) return;
        s.saveExam({ name: name.trim(), date, subjectIds: 'all' });
        setName(''); setDate('');
      }}>
        <input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder="e.g. Unit test 2, Half-yearly" aria-label="Exam name" />
        <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} aria-label="Exam date" />
        <button className="btn primary" disabled={!name.trim() || !date}>Add exam</button>
      </form>
    </div>
  );
}

function ExamRow({ exam, past }: { exam: Exam; past: boolean }) {
  const s = useStore();
  const all = exam.subjectIds === 'all';
  const chosen = all ? [] : (exam.subjectIds as string[]);
  const toggle = (id: string) => {
    const next = chosen.includes(id) ? chosen.filter((x) => x !== id) : [...chosen, id];
    s.saveExam({ ...exam, subjectIds: next.length ? next : 'all' });
  };
  return (
    <div className={`exam-row ${past ? 'past' : ''}`}>
      <div className="row wrap">
        <input value={exam.name} maxLength={40} onChange={(e) => s.saveExam({ ...exam, name: e.target.value })} aria-label="Exam name" />
        <input type="date" value={exam.date} onChange={(e) => e.target.value && s.saveExam({ ...exam, date: e.target.value })} aria-label="Exam date" />
        {past && <span className="pill">Done</span>}
        <button className="btn ghost small" aria-label={`Remove ${exam.name}`} onClick={() => { if (confirm(`Remove ${exam.name}?`)) s.deleteExam(exam.id); }}>✕</button>
      </div>
      <div className="chips">
        <button className={`chip small-chip ${all ? 'on' : ''}`} onClick={() => s.saveExam({ ...exam, subjectIds: 'all' })}>All subjects</button>
        {s.subjects.map((x) => (
          <button key={x.id} className={`chip small-chip ${chosen.includes(x.id) ? 'on' : ''}`} onClick={() => toggle(x.id)}>{x.name}</button>
        ))}
      </div>
    </div>
  );
}
