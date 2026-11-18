import { useCallback, useEffect, useRef, useState } from 'react';
import type { StageId } from '../types';
import { useStore } from '../store';
import { config } from '../config';
import { stageIndex } from '../engine/creature';
import { dropImage, storeImage } from '../lib/sync';
import { useImage } from '../lib/useImage';
import { usePlayMeter } from '../lib/usePlayMeter';
import { uid } from '../engine/planner';
import { lines } from '../lib/voice';
import { play } from '../lib/sound';
import { Bubble } from '../components/Bubble';
import type { Screen } from '../App';

type Brush = 'pen' | 'pencil' | 'marker' | 'eraser' | 'spray' | 'glow' | 'rainbow';
const BRUSHES: { id: Brush; label: string; stage: StageId }[] = [
  { id: 'pen', label: 'Pen', stage: 'hatchling' },
  { id: 'pencil', label: 'Pencil', stage: 'hatchling' },
  { id: 'marker', label: 'Marker', stage: 'hatchling' },
  { id: 'eraser', label: 'Eraser', stage: 'hatchling' },
  { id: 'spray', label: 'Spray', stage: 'juvenile' },
  { id: 'glow', label: 'Glow', stage: 'teen' },
  { id: 'rainbow', label: 'Rainbow', stage: 'adult' },
];
const BASE_COLORS = ['#1b1b1f', '#ffffff', '#e63946', '#f4a261', '#f6d55c', '#2a9d8f', '#3a86ff', '#8338ec', '#ff5fa2', '#8d5524', '#6ab04c', '#9aa0a6'];
const EXTRA_COLORS = ['#00b4d8', '#ffb4a2', '#cdb4db', '#b5e48c', '#ffd6a5', '#3d405b'];
const W = 960, H = 640;

type Tool = 'brush' | 'shape' | 'text';
type Shape = 'line' | 'rect' | 'circle' | 'triangle' | 'diamond' | 'hexagon' | 'star';
const SHAPES: { id: Shape; label: string }[] = [
  { id: 'line', label: '╱' }, { id: 'rect', label: '▭' }, { id: 'circle', label: '◯' }, { id: 'triangle', label: '△' },
  { id: 'diamond', label: '◇' }, { id: 'hexagon', label: '⬡' }, { id: 'star', label: '☆' },
];
const SHAPE_NAME: Record<Shape, string> = { line: 'Line', rect: 'Rectangle', circle: 'Circle', triangle: 'Triangle', diamond: 'Diamond', hexagon: 'Hexagon', star: 'Star' };
const FONTS: { id: string; label: string; family: () => string }[] = [
  { id: 'fun', label: 'Fun', family: () => getComputedStyle(document.documentElement).getPropertyValue('--font-display') || 'sans-serif' },
  { id: 'clean', label: 'Clean', family: () => getComputedStyle(document.documentElement).getPropertyValue('--font-body') || 'sans-serif' },
  { id: 'fancy', label: 'Fancy', family: () => 'Georgia, "Times New Roman", serif' },
  { id: 'hand', label: 'Handwritten', family: () => '"Segoe Print", "Bradley Hand", "Comic Sans MS", cursive' },
  { id: 'poster', label: 'Poster', family: () => 'Impact, "Arial Black", sans-serif' },
];
type Pt = { x: number; y: number };

/** Outline of a shape dragged from a to b (canvas coordinates). */
function shapePath(c: CanvasRenderingContext2D, shape: Shape, a: Pt, b: Pt, even: boolean) {
  if (even && shape !== 'line') {
    const d = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    b = { x: a.x + Math.sign(b.x - a.x || 1) * d, y: a.y + Math.sign(b.y - a.y || 1) * d };
  }
  const x0 = Math.min(a.x, b.x), y0 = Math.min(a.y, b.y), w = Math.abs(b.x - a.x), h = Math.abs(b.y - a.y);
  const cx = x0 + w / 2, cy = y0 + h / 2;
  const poly = (pts: [number, number][]) => { c.moveTo(pts[0][0], pts[0][1]); for (const q of pts.slice(1)) c.lineTo(q[0], q[1]); c.closePath(); };
  c.beginPath();
  if (shape === 'line') { c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); }
  else if (shape === 'rect') c.rect(x0, y0, w, h);
  else if (shape === 'circle') c.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
  else if (shape === 'triangle') poly([[cx, y0], [x0 + w, y0 + h], [x0, y0 + h]]);
  else if (shape === 'diamond') poly([[cx, y0], [x0 + w, cy], [cx, y0 + h], [x0, cy]]);
  else if (shape === 'hexagon') poly([0, 1, 2, 3, 4, 5].map((i) => [cx + (w / 2) * Math.cos((Math.PI / 3) * i), cy + (h / 2) * Math.sin((Math.PI / 3) * i)]));
  else poly(Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? 0.42 : 1, ang = -Math.PI / 2 + (Math.PI / 5) * i;
    return [cx + (w / 2) * r * Math.cos(ang), cy + (h / 2) * r * Math.sin(ang)] as [number, number];
  }));
}

export function ArtRoom({ go }: { go: (s: Screen) => void }) {
  const s = useStore();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [brush, setBrush] = useState<Brush>('pen');
  const [color, setColor] = useState('#1b1b1f');
  const [size, setSize] = useState(8);
  const [undo, setUndo] = useState<ImageData[]>([]);
  const [redo, setRedo] = useState<ImageData[]>([]);
  const [tab, setTab] = useState<'draw' | 'gallery'>('draw');
  const [saved, setSaved] = useState(false);
  const drawing = useRef<{ x: number; y: number } | null>(null);
  const [tool, setTool] = useState<Tool>('brush');
  const [shape, setShape] = useState<Shape>('rect');
  const [filled, setFilled] = useState(false);
  const [even, setEven] = useState(false);
  const [font, setFont] = useState('fun');
  const [textBox, setTextBoxState] = useState<(Pt & { value: string }) | null>(null);
  const textRef = useRef<(Pt & { value: string }) | null>(null);
  const setTextBox = (v: (Pt & { value: string }) | null) => { textRef.current = v; setTextBoxState(v); };
  const shapeStart = useRef<{ p: Pt; base: ImageData } | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const textPx = 14 + size * 3;
  const hue = useRef(0);
  const stageIdx = stageIndex(s.creature.stage);
  const brushes = BRUSHES.filter((b) => stageIndex(b.stage) <= stageIdx);
  const colors = stageIdx >= stageIndex('juvenile') ? [...BASE_COLORS, ...EXTRA_COLORS] : BASE_COLORS;

  const { leftSec, timeUp } = usePlayMeter('art');

  useEffect(() => {
    const ctx = canvas.current!.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
  }, []);

  const ctx = () => canvas.current!.getContext('2d')!;
  const snapshot = useCallback(() => {
    const img = ctx().getImageData(0, 0, W, H); // capture now, before anything new is drawn
    setUndo((u) => [...u.slice(-29), img]);
    setRedo([]);
    setSaved(false);
  }, []);

  /** Where the picture actually sits inside the canvas element (it is letterboxed when the screen is wide). */
  const view = () => {
    const r = canvas.current!.getBoundingClientRect();
    const scale = Math.min(r.width / W, r.height / H);
    return { r, scale, ox: (r.width - W * scale) / 2, oy: (r.height - H * scale) / 2 };
  };
  const pos = (e: React.PointerEvent) => {
    const { r, scale, ox, oy } = view();
    return { x: (e.clientX - r.left - ox) / scale, y: (e.clientY - r.top - oy) / scale };
  };

  const stroke = (from: { x: number; y: number }, to: { x: number; y: number }, pressure: number) => {
    const c = ctx();
    c.save();
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.globalCompositeOperation = 'source-over';
    let col = color, width = size * (0.5 + pressure);
    if (brush === 'eraser') { col = '#ffffff'; width = size * 2; }
    if (brush === 'pencil') { width = Math.max(1, size / 3); c.globalAlpha = 0.7; }
    if (brush === 'marker') { width = size * 2.2; c.globalAlpha = 0.35; }
    if (brush === 'glow') { c.shadowColor = color; c.shadowBlur = size * 2; }
    if (brush === 'rainbow') { hue.current = (hue.current + 4) % 360; col = `hsl(${hue.current} 90% 55%)`; }
    if (brush === 'spray') {
      c.fillStyle = col;
      for (let i = 0; i < size * 3; i++) {
        const a = Math.random() * Math.PI * 2, r = Math.random() * size * 2;
        c.fillRect(to.x + Math.cos(a) * r, to.y + Math.sin(a) * r, 1.5, 1.5);
      }
    } else {
      c.strokeStyle = col;
      c.lineWidth = width;
      c.beginPath();
      c.moveTo(from.x, from.y);
      c.lineTo(to.x, to.y);
      c.stroke();
    }
    c.restore();
  };

  const drawShape = (to: Pt) => {
    const st = shapeStart.current;
    if (!st) return;
    const c = ctx();
    c.putImageData(st.base, 0, 0);
    c.save();
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = color; c.fillStyle = color; c.lineWidth = Math.max(2, size / 2);
    shapePath(c, shape, st.p, to, even);
    if (filled && shape !== 'line') c.fill(); else c.stroke();
    c.restore();
  };

  const commitText = () => {
    const tb = textRef.current;
    if (!tb) return;
    setTextBox(null);
    if (!tb.value.trim()) return;
    snapshot();
    const c = ctx();
    c.save();
    c.font = `600 ${textPx}px ${FONTS.find((f) => f.id === font)!.family()}`;
    c.fillStyle = color; c.textBaseline = 'top';
    c.fillText(tb.value, tb.x + 2, tb.y + 2);
    c.restore();
    play('sparkle');
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = pos(e);
    if (tool === 'text') { e.preventDefault(); commitText(); setTextBox({ ...p, value: '' }); return; }
    e.currentTarget.setPointerCapture(e.pointerId);
    snapshot();
    if (tool === 'shape') { shapeStart.current = { p, base: ctx().getImageData(0, 0, W, H) }; return; }
    drawing.current = p; stroke(p, p, e.pressure || 0.5);
  };
  const onMove = (e: React.PointerEvent) => {
    if (shapeStart.current) { drawShape(pos(e)); return; }
    if (!drawing.current) return; const p = pos(e); stroke(drawing.current, p, e.pressure || 0.5); drawing.current = p;
  };
  const onUp = (e: React.PointerEvent) => {
    if (shapeStart.current) { drawShape(pos(e)); shapeStart.current = null; }
    drawing.current = null;
  };

  const doUndo = () => {
    const last = undo.at(-1);
    if (!last) return;
    setRedo((r) => [...r, ctx().getImageData(0, 0, W, H)]);
    ctx().putImageData(last, 0, 0);
    setUndo((u) => u.slice(0, -1));
  };
  const doRedo = () => {
    const last = redo.at(-1);
    if (!last) return;
    setUndo((u) => [...u, ctx().getImageData(0, 0, W, H)]);
    ctx().putImageData(last, 0, 0);
    setRedo((r) => r.slice(0, -1));
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) doRedo(); else doUndo(); }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  const save = async () => {
    const id = uid('art');
    await storeImage(id, canvas.current!.toDataURL('image/png'));
    s.addGalleryItem(id);
    setSaved(true);
    play('sparkle');
  };

  return (
    <div className="page art-room">
      <div className="row between wrap">
        <h1>Art studio</h1>
        <div className="row">
          <span className="pill strong" aria-live="polite">{Math.max(0, Math.floor(leftSec / 60))} min left</span>
          <div className="tabs">
            <button className={tab === 'draw' ? 'on' : ''} onClick={() => setTab('draw')}>Canvas</button>
            <button className={tab === 'gallery' ? 'on' : ''} onClick={() => setTab('gallery')}>Gallery ({s.gallery.length})</button>
          </div>
          <button className="btn ghost" onClick={() => go('rooms')}>Leave</button>
        </div>
      </div>

      <div hidden={tab !== 'draw'}>
        <div className="toolbar">
          <div className="seg" aria-label="Tool">
            {(['brush', 'shape', 'text'] as Tool[]).map((t) => (
              <button key={t} className={tool === t ? 'on' : ''} onClick={() => { commitText(); setTool(t); }}>{t === 'brush' ? '🖌️ Brushes' : t === 'shape' ? '🔷 Shapes' : '🔤 Text'}</button>
            ))}
          </div>
          {tool === 'brush' && <div className="seg">
            {brushes.map((b) => <button key={b.id} className={brush === b.id ? 'on' : ''} onClick={() => setBrush(b.id)}>{b.label}</button>)}
          </div>}
          {tool === 'shape' && <>
            <div className="seg shape-seg">
              {SHAPES.map((x) => <button key={x.id} title={SHAPE_NAME[x.id]} aria-label={SHAPE_NAME[x.id]} className={shape === x.id ? 'on' : ''} onClick={() => setShape(x.id)}>{x.label}</button>)}
            </div>
            <div className="seg">
              <button className={!filled ? 'on' : ''} onClick={() => setFilled(false)}>Outline</button>
              <button className={filled ? 'on' : ''} onClick={() => setFilled(true)}>Filled</button>
            </div>
            <label className="switch small"><input type="checkbox" checked={even} onChange={(e) => setEven(e.target.checked)} /> Perfect (even sides)</label>
          </>}
          {tool === 'text' && <div className="seg">
            {FONTS.map((f) => <button key={f.id} className={font === f.id ? 'on' : ''} style={{ fontFamily: f.family() }} onClick={() => setFont(f.id)}>{f.label}</button>)}
          </div>}
          <div className="palette">
            {colors.map((c) => (
              <button key={c} aria-label={`Colour ${c}`} className={`swatch ${color === c ? 'on' : ''}`} style={{ background: c }} onClick={() => { setColor(c); if (brush === 'eraser') setBrush('pen'); }} />
            ))}
            <input type="color" aria-label="Custom colour" value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
          <label className="row small">{tool === 'text' ? 'Text size' : tool === 'shape' ? 'Line' : 'Size'} <input type="range" min={1} max={40} value={size} onChange={(e) => setSize(+e.target.value)} /></label>
          <div className="row">
            <button className="btn small" onClick={doUndo} disabled={!undo.length}>Undo</button>
            <button className="btn small" onClick={doRedo} disabled={!redo.length}>Redo</button>
            <button className="btn small" onClick={() => { snapshot(); const c = ctx(); c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); }}>Clear</button>
            <button className="btn small primary" onClick={save} disabled={saved}>{saved ? 'Saved ✓' : 'Save to gallery'}</button>
          </div>
        </div>
        {tool === 'shape' && <p className="muted small">Press and drag on the canvas to draw a {SHAPE_NAME[shape].toLowerCase()}.</p>}
        {tool === 'text' && <p className="muted small">Tap the canvas where you want words, type, then press Enter.</p>}
        <div className="art-wrap" ref={wrap}>
          <canvas
            ref={canvas}
            width={W}
            height={H}
            className={`art-canvas ${tool === 'text' ? 'text-mode' : ''}`}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={(e) => { if (!shapeStart.current) drawing.current = null; else onMove(e); }}
          />
          {textBox && (() => {
            const { scale, ox, oy } = view();
            return (
              <input
                autoFocus
                className="art-text-input"
                aria-label="Text for your picture"
                placeholder="Type here…"
                value={textBox.value}
                maxLength={80}
                style={{ left: ox + textBox.x * scale, top: oy + textBox.y * scale, fontSize: textPx * scale, color, fontFamily: FONTS.find((f) => f.id === font)!.family() }}
                onChange={(e) => setTextBox({ ...textBox, value: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') commitText(); if (e.key === 'Escape') setTextBox(null); }}
                onBlur={commitText}
              />
            );
          })()}
        </div>
        {stageIdx < stageIndex('juvenile') && <p className="muted small">New brushes and colours appear as your creature evolves.</p>}
      </div>

      {tab === 'gallery' && <Gallery />}

      {timeUp && (
        <div className="overlay">
          <div className="modal center">
            <Bubble>{lines.timeUp}</Bubble>
            <div className="row center-row">
              {!saved && <button className="btn" onClick={async () => { commitText(); await save(); go('home'); }}>Save my picture and go</button>}
              <button className="btn primary" onClick={() => go('home')}>Back home</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Gallery() {
  const s = useStore();
  const [designFor, setDesignFor] = useState<string | null>(null);
  const stages = config.stages.filter((x) => x.id !== 'egg');

  const upload = async (file: File) => {
    const dataUrl = await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(file); });
    const id = uid('art');
    await storeImage(id, dataUrl);
    s.addGalleryItem(id);
  };

  return (
    <div className="stack">
      <div className="card">
        <h3>Design your creature</h3>
        <p className="muted small">Pick any drawing from your gallery to replace the placeholder creature art for a stage. Placeholders stay until you do.</p>
        <div className="row wrap">
          {stages.map((st) => (
            <div key={st.id} className="stage-slot">
              <strong>{st.name}</strong>
              <StageThumb id={s.creature.customArt[st.id]} />
              {s.creature.customArt[st.id] && <button className="btn ghost small" onClick={() => s.setCustomArt(st.id)}>Use placeholder</button>}
            </div>
          ))}
        </div>
        <label className="btn small">Upload a drawing <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} /></label>
      </div>
      {!s.gallery.length && <p className="muted">Your saved drawings will appear here.</p>}
      <div className="gallery-grid">
        {s.gallery.map((g) => (
          <div key={g.id} className="card gallery-item">
            <StageThumb id={g.id} big />
            <div className="row wrap">
              <button className="btn small" onClick={() => s.togglePin(g.id)}>{g.pinned ? '📌 Pinned at home' : 'Pin at home'}</button>
              <button className="btn small" onClick={() => setDesignFor(designFor === g.id ? null : g.id)}>Use for creature…</button>
              <button className="btn small ghost" onClick={async () => { await dropImage(g.id); s.removeGalleryItem(g.id); }}>Delete</button>
            </div>
            {designFor === g.id && (
              <div className="row wrap">
                {stages.map((st) => <button key={st.id} className="btn small" onClick={() => { s.setCustomArt(st.id, g.id); setDesignFor(null); play('unlock'); }}>{st.name}</button>)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StageThumb({ id, big }: { id?: string; big?: boolean }) {
  const src = useImage(id);
  return src ? <img src={src} alt="" className={big ? 'thumb big' : 'thumb'} /> : <div className={`thumb empty ${big ? 'big' : ''}`}>placeholder</div>;
}
