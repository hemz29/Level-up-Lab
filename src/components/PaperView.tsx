import type { Paper, PaperItem, PaperQuestion } from '../engine/worksheet';
import { OutlineMap } from './OutlineMap';

interface Props { paper: Paper; schoolName?: string; grade?: number; answerKey?: boolean; answerSpace?: boolean }

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
const BIG_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const Lines = ({ n }: { n: number }) => (n > 0 ? <div className="answer-lines" aria-hidden="true">{Array.from({ length: n }, (_, i) => <span key={i} />)}</div> : null);
const marksTag = (m: number) => <span className="q-marks">({m})</span>;
const GRADE = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

/** A printable question paper (or its answer key), laid out like the school's paper. */
export function PaperView({ paper, schoolName, grade = 6, answerKey = false, answerSpace }: Props) {
  const space = !answerKey && (answerSpace ?? paper.answerSpace);
  const maps = paper.mapAtEnd ? paper.sections.flatMap((s) => s.questions.filter((q) => q.map)) : [];
  return (
    <article className={`paper ${answerKey ? 'answer-key' : ''}`}>
      <header className="paper-head">
        {schoolName && <p className="paper-school">{schoolName}</p>}
        <h1>{paper.title}{answerKey ? ' · Answer key' : ''}</h1>
        <p className="paper-sub">Subject: {paper.subject}</p>
        <div className="paper-meta">
          <span>Grade : {GRADE[grade] ?? grade}</span>
          <span>Duration : {paper.minutes ? (paper.minutes >= 60 ? `${paper.minutes / 60} hour${paper.minutes > 60 ? 's' : ''}` : `${paper.minutes} min`) : 'as needed'}</span>
        </div>
        <div className="paper-meta">
          <span>Date : ____________</span>
          <span>Max. Marks : {paper.marks}</span>
        </div>
        {!answerKey && (paper.instructions?.length
          ? <div className="paper-school-instr">{paper.instructions.map((t) => <p key={t}>{t}</p>)}</div>
          : (
            <ul className="paper-instructions">
              <li>Read each question carefully and underline the key words before you answer.</li>
              <li>The marks for each question are shown in brackets ( ). Let them guide the length of your answer.</li>
              <li>Re-read your answers and check your work before you hand in the paper.</li>
            </ul>
          ))}
        <p className="paper-chapters">Chapters: {paper.chapters.join('; ')}</p>
      </header>

      {!answerKey && paper.notes?.length ? (
        <div className="paper-notes"><strong>Note:</strong><ol type="i">{paper.notes.map((n) => <li key={n}>{n}</li>)}</ol></div>
      ) : null}

      {paper.sections.map((s, si) => (
        <section key={si} className="paper-section">
          {s.title && <h2>{s.title}</h2>}
          {s.questions.map((q) => <Question key={q.number} q={q} answerKey={answerKey} space={space} mapInline={!paper.mapAtEnd} roman={paper.numbering === 'roman'} />)}
        </section>
      ))}

      {maps.map((q) => (
        <section key={`map-${q.number}`} className="paper-map-page">
          {!answerKey && <div className="paper-student"><span>Name: <i /></span><span>Roll no.: <i /></span></div>}
          <p className="paper-map-title">Map for Question {q.number}{answerKey ? ' · answers' : ''}</p>
          <OutlineMap marks={q.map!.features} showNames={answerKey} className="q-map big" />
        </section>
      ))}
      <p className="paper-end">✦ End of paper ✦</p>
    </article>
  );
}

function Question({ q, answerKey, space, mapInline, roman }: { q: PaperQuestion; answerKey: boolean; space: boolean; mapInline: boolean; roman: boolean }) {
  const each = q.marksEach ?? (q.items.length && q.items.every((i) => i.marks === q.items[0].marks) ? q.items[0].marks : undefined);
  return (
    <div className="paper-q">
      {roman ? (
        <div className="q-head roman">
          <span className="q-num">{BIG_ROMAN[q.number - 1]}.</span>
          <span className="q-heading">{q.heading}</span>
          {!q.pictures && <span className="q-marks">({each ? `${each}x${q.items.length}=${q.marks}` : q.marks})</span>}
        </div>
      ) : (
        <>
          <div className="q-head">
            <span className="q-num">QUESTION {q.number}</span>
          </div>
          <div className="q-head sub">
            {q.heading && <span className="q-heading">{q.heading}</span>}
            {marksTag(q.marks)}
          </div>
        </>
      )}
      {q.pictures && (
        <table className="q-pictures">
          <tbody>
            {q.pictures.map((pic, pi) => (
              <tr key={pi}>
                <td className="pic-cell">
                  {pic.image ? <img src={pic.image} alt={pic.scene} /> : <div className="pic-placeholder"><span>Picture</span><p>{pic.scene}</p></div>}
                </td>
                <td>
                  <p className="pic-num">{pi + 1})</p>
                  {pic.parts.map((pt) => (
                    <div key={pt.label} className="pic-part">
                      <p>{pic.parts.length > 1 ? `${pt.label.replace('.', ')')} ` : ''}{pt.text} <strong>({pt.marks})</strong></p>
                      {answerKey && <p className="key-a">{pt.answer}</p>}
                    </div>
                  ))}
                  {answerKey && <p className="key-src">{pic.parts[0]?.source}</p>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {q.passage && <blockquote className="q-passage">{q.passage}</blockquote>}
      {q.chart && <BarChart chart={q.chart} />}
      {q.fillTable && (
        <table className="q-match q-fill">
          <thead><tr><th>Sr. No.</th><th>{q.fillTable.leftTitle}</th><th>{q.fillTable.rightTitle}</th></tr></thead>
          <tbody>
            {q.fillTable.left.map((l, i) => (
              <tr key={l}><td>{ROMAN[i]}.</td><td>{l}</td><td className="key-a">{answerKey ? q.items[i].answer.split(': ').slice(1).join(': ') : ''}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      {q.match && !answerKey && (
        <table className="q-match">
          <thead><tr><th>{q.match.leftTitle}</th><th>{q.match.rightTitle}</th></tr></thead>
          <tbody>
            {q.match.left.map((l, i) => (
              <tr key={l}><td>({'abcdefghij'[i]}) {l}</td><td>({ROMAN[i]}) {q.match!.right[i]}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      {q.map && mapInline && <OutlineMap marks={q.map.features} showNames={answerKey} className="q-map" />}
      {q.pictures ? null : q.fillTable ? (answerKey ? <p className="key-src">{q.items[0]?.source}</p> : null) : (!q.match || answerKey) ? (
        <ol className={`q-items ${q.items.every((i) => i.options) ? 'mcq' : ''}`}>
          {q.items.map((it, i) => <Item key={it.label + i} it={{ ...it, label: roman ? `${i + 1})` : `${ROMAN[i]}.` }} answerKey={answerKey} space={space} isMap={!!q.map} isMatch={!!q.match} hideMarks={roman} />)}
        </ol>
      ) : null}
    </div>
  );
}

function Item({ it, answerKey, space, isMap, isMatch, hideMarks }: { it: PaperItem; answerKey: boolean; space: boolean; isMap: boolean; isMatch: boolean; hideMarks?: boolean }) {
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
  if (isMap && !it.text) return <li className="q-item identify"><span className="q-label">{it.label}</span><span className="blank-line" /></li>;
  return (
    <li className="q-item">
      <span className="q-label">{it.label}</span>
      <div className="q-body">
        <p>{it.text}</p>
        {it.options && <div className="q-options">{it.options.map((o) => <span key={o}>{o}</span>)}</div>}
        {it.table && space && (
          <table className="q-diff blank"><thead><tr><th>{it.table[0][0]}</th><th>{it.table[0][1]}</th></tr></thead>
            <tbody>{it.table.slice(1).map((_, i) => <tr key={i}><td /><td /></tr>)}</tbody></table>
        )}
        {space && !it.table && <Lines n={it.lines} />}
      </div>
      {!hideMarks && <span className="q-marks item">({it.marks})</span>}
    </li>
  );
}

/** Printable bar chart for "answer with the help of the given illustration". */
function BarChart({ chart }: { chart: NonNullable<PaperQuestion['chart']> }) {
  const W = 560, H = 300, L = 64, R = 12, T = 44, B = 46;
  const max = Math.max(...chart.bars.map((b) => b.value));
  const step = niceStep(max);
  const top = Math.ceil(max / step) * step;
  const iw = W - L - R, ih = H - T - B;
  const slot = iw / chart.bars.length;
  const bw = Math.min(64, slot * 0.7);
  const y = (v: number) => T + ih - (v / top) * ih;
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  return (
    <figure className="q-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={chart.title}>
        <rect x="0.5" y="0.5" width={W - 1} height={H - 1} fill="#fff" stroke="#222" />
        <text x={W / 2} y={24} textAnchor="middle" fontSize="16" fontWeight="700" fill="#222">{chart.title}</text>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#ccc" strokeDasharray="3 3" />
            <text x={L - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#333">{t.toLocaleString()}</text>
          </g>
        ))}
        <text transform={`translate(16 ${T + ih / 2}) rotate(-90)`} textAnchor="middle" fontSize="12" fill="#333">{chart.yLabel}</text>
        {chart.bars.map((b, i) => {
          const x = L + slot * i + (slot - bw) / 2;
          return (
            <g key={b.label}>
              <rect x={x} y={y(b.value)} width={bw} height={y(0) - y(b.value)} fill="#555" />
              <text x={x + bw / 2} y={H - B + 16} textAnchor="middle" fontSize={chart.bars.length > 6 ? 10 : 12} fill="#222">{b.label}</text>
              {chart.bars.length <= 6 && <text x={x + bw / 2} y={y(b.value) - 5} textAnchor="middle" fontSize="11" fill="#222">{b.value.toLocaleString()}</text>}
              {b.note && <text x={i === chart.bars.length - 1 ? x + bw : x + bw / 2} y={y(b.value) - (chart.bars.length <= 6 ? 18 : 6)} textAnchor={i === chart.bars.length - 1 ? 'end' : 'middle'} fontSize="10" fill="#222" fontStyle="italic">{b.note}</text>}
            </g>
          );
        })}
        <line x1={L} x2={W - R} y1={y(0)} y2={y(0)} stroke="#222" />
      </svg>
      {chart.source && <figcaption>{chart.source}</figcaption>}
    </figure>
  );
}

function niceStep(max: number) {
  const raw = max / 6;
  const p = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? raw;
}
