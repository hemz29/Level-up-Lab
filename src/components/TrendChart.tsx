import { useEffect, useRef, useState } from 'react';
import { prettyDay } from '../engine/dates';

export interface TrendPoint { date: string; value: number | null; label?: string; tip?: string }

interface Props {
  title: string;
  points: TrendPoint[];
  kind: 'line' | 'bar';
  max?: number;
  format: (v: number) => string;
  empty: string;
}

const H = 200, PAD = { l: 44, r: 12, t: 14, b: 26 };

/** One series per chart (the title names it): a line for scores, bars for amounts. Hover shows the value. */
export function TrendChart({ title, points, kind, max, format, empty }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  // draw at the real width so text stays a normal size
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(640);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const vals = points.map((p) => p.value).filter((v): v is number => v !== null);
  const top = max ?? Math.max(1, ...vals) * 1.15;
  const iw = W - PAD.l - PAD.r, ih = H - PAD.t - PAD.b;
  const slot = iw / points.length; // each point sits in the middle of its own slot
  const x = (i: number) => PAD.l + (i + 0.5) * slot;
  const y = (v: number) => PAD.t + ih - (v / top) * ih;
  const ticks = [0, 0.5, 1].map((k) => k * top);
  const bw = Math.max(3, Math.min(22, slot - 4));
  const labelEvery = Math.max(1, Math.ceil(points.length / Math.max(2, Math.floor(iw / 70))));

  const path = points.reduce((d, p, i) => (p.value === null ? d : `${d}${d && points[i - 1]?.value !== null ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`), '');
  const hp = hover !== null ? points[hover] : null;

  return (
    <figure className="trend">
      <figcaption>{title}</figcaption>
      {!vals.length ? <p className="muted small">{empty}</p> : (
        <div className="trend-plot" ref={box} onMouseLeave={() => setHover(null)}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="trend-grid" />
                <text x={PAD.l - 6} y={y(t) + 4} textAnchor="end" className="trend-axis">{format(t)}</text>
              </g>
            ))}
            {points.map((p, i) => ((i % labelEvery === 0 && points.length - 1 - i >= labelEvery * 0.75) || i === points.length - 1) && (
              <text key={p.date + i} x={x(i)} y={H - 6} textAnchor="middle" className="trend-axis">{p.label ?? shortDay(p.date)}</text>
            ))}
            {kind === 'bar' && points.map((p, i) => p.value ? (
              <path key={i} className={`trend-bar ${hover === i ? 'on' : ''}`}
                d={`M${x(i) - bw / 2},${y(0)} V${y(p.value) + 4} q0,-4 4,-4 h${bw - 8} q4,0 4,4 V${y(0)} Z`} />
            ) : null)}
            {kind === 'line' && <path d={path} className="trend-line" />}
            {kind === 'line' && points.map((p, i) => p.value !== null && (
              <circle key={i} cx={x(i)} cy={y(p.value)} r={hover === i ? 6 : 4.5} className="trend-dot" />
            ))}
            {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={y(0)} className="trend-cross" />}
            {points.map((_, i) => (
              <rect key={i} x={x(i) - slot / 2} y={PAD.t} width={slot} height={ih}
                fill="transparent" onMouseEnter={() => setHover(i)} onTouchStart={() => setHover(i)} />
            ))}
          </svg>
          {hp && hp.value !== null && (
            <div className="trend-tip" style={{ left: `${(x(hover!) / W) * 100}%` }}>
              <strong>{format(hp.value)}</strong><span>{hp.tip ?? prettyDay(hp.date)}</span>
            </div>
          )}
        </div>
      )}
      {vals.length > 0 && (
        <details className="trend-table">
          <summary>Show as a table</summary>
          <table><tbody>
            {points.filter((p) => p.value !== null).map((p, i) => <tr key={i}><td>{p.tip ?? prettyDay(p.date)}</td><td>{format(p.value!)}</td></tr>)}
          </tbody></table>
        </details>
      )}
    </figure>
  );
}

const shortDay = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
