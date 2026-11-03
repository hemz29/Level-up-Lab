import type { Paper, PaperItem, PaperQuestion } from '../engine/worksheet';
import { OutlineMap } from './OutlineMap';

interface Props { paper: Paper; schoolName?: string; grade?: number; answerKey?: boolean; answerSpace?: boolean }

const Lines = ({ n }: { n: number }) => (n > 0 ? <div className="answer-lines" aria-hidden="true">{Array.from({ length: n }, (_, i) => <span key={i} />)}</div> : null);
const marksTag = (m: number) => <span className="q-marks">[{m}]</span>;

/** A printable question paper (or its answer key), laid out like a school paper. */
export function PaperView({ paper, schoolName, grade = 6, answerKey = false, answerSpace }: Props) {
  const space = !answerKey && (answerSpace ?? paper.answerSpace);
  return (
    <article className={`paper ${answerKey ? 'answer-key' : ''}`}>
      <header className="paper-head">
        {schoolName && <p className="paper-school">{schoolName}</p>}
        <h1>{paper.title}{answerKey ? ' · Answer key' : ''}</h1>
        <p className="paper-sub">{paper.subject} · Grade {grade}</p>
        <div className="paper-meta">
          <span>Maximum marks: {paper.marks}</span>
          {paper.minutes ? <span>Time: {paper.minutes >= 60 ? `${paper.minutes / 60} hour${paper.minutes > 60 ? 's' : ''}` : `${paper.minutes} minutes`}</span> : <span>Time: as needed</span>}
        </div>
        {!answerKey && (
          <div className="paper-student">
            <span>Name: <i /></span><span>Roll no.: <i /></span><span>Date: <i /></span>
          </div>
        )}
        <p className="paper-chapters">Chapters: {paper.chapters.join('; ')}</p>
        {!answerKey && (
          <ul className="paper-instructions">
            <li>Read each question carefully and underline the key words before you answer.</li>
            <li>The marks for each question are shown in brackets [ ]. Let them guide the length of your answer.</li>
            <li>Re-read your answers and check your work before you hand in the paper.</li>
          </ul>
        )}
      </header>

      {paper.sections.map((s) => (
        <section key={s.title} className="paper-section">
          <h2>{s.title}</h2>
          {s.questions.map((q) => <Question key={q.number} q={q} answerKey={answerKey} space={space} />)}
        </section>
      ))}
      <p className="paper-end">✦ End of paper ✦</p>
    </article>
  );
}

function Question({ q, answerKey, space }: { q: PaperQuestion; answerKey: boolean; space: boolean }) {
  return (
    <div className="paper-q">
      <div className="q-head">
        <span className="q-num">Question {q.number}</span>
        {q.heading && <span className="q-heading">{q.heading}</span>}
        {marksTag(q.marks)}
      </div>
      {q.passage && <blockquote className="q-passage">{q.passage}</blockquote>}
      {q.match && !answerKey && (
        <table className="q-match">
          <thead><tr><th>{q.match.leftTitle}</th><th>{q.match.rightTitle}</th></tr></thead>
          <tbody>
            {q.match.left.map((l, i) => (
              <tr key={l}><td>({'abcdefghij'[i]}) {l}</td><td>({['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'][i]}) {q.match!.right[i]}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      {q.map && <OutlineMap marks={q.map.features} showNames={answerKey} className="q-map" />}
      {!q.match || answerKey ? (
        <ol className={`q-items ${q.items.every((i) => i.options) ? 'mcq' : ''}`}>
          {q.items.map((it) => <Item key={it.label} it={it} answerKey={answerKey} space={space} isMap={!!q.map || q.heading.includes('map')} isMatch={!!q.match} />)}
        </ol>
      ) : null}
    </div>
  );
}

function Item({ it, answerKey, space, isMap, isMatch }: { it: PaperItem; answerKey: boolean; space: boolean; isMap: boolean; isMatch: boolean }) {
  if (answerKey) {
    return (
      <li className="q-item">
        <span className="q-label">{it.label}</span>
        <div className="q-body">
          {it.text && !isMatch && <p className="key-q">{it.text}</p>}
          {it.table ? (
            <table className="q-diff"><thead><tr><th>{it.table[0][0]}</th><th>{it.table[0][1]}</th></tr></thead>
              <tbody>{it.table.slice(1).map((r, i) => <tr key={i}><td>{r[0]}</td><td>{r[1]}</td></tr>)}</tbody></table>
          ) : <p className="key-a">{it.answer}</p>}
          <p className="key-src">{it.source}{it.marks ? ` · ${it.marks} mark${it.marks > 1 ? 's' : ''}` : ''}</p>
        </div>
      </li>
    );
  }
  if (isMap && !it.text) return <li className="q-item identify"><span className="q-label">{it.label}</span><span className="blank-line" /></li>; // identify: write the name
  return (
    <li className="q-item">
      <span className="q-label">{it.label}</span>
      <div className="q-body">
        <p>{it.text}{it.marks > 1 && !it.options ? <span className="item-marks"> [{it.marks}]</span> : null}</p>
        {it.options && <div className="q-options">{it.options.map((o) => <span key={o}>{o}</span>)}</div>}
        {it.table && space && (
          <table className="q-diff blank"><thead><tr><th>{it.table[0][0]}</th><th>{it.table[0][1]}</th></tr></thead>
            <tbody>{it.table.slice(1).map((_, i) => <tr key={i}><td /><td /></tr>)}</tbody></table>
        )}
        {space && !it.table && <Lines n={it.lines} />}
      </div>
    </li>
  );
}
