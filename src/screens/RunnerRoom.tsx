import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { WORLDS } from '../lib/worlds';
import { usePlayMeter } from '../lib/usePlayMeter';
import { play } from '../lib/sound';
import { TimeUpOverlay } from '../components/TimeUpOverlay';
import type { Screen } from '../App';

const W = 960, H = 420, GROUND = 340, GRAV = 2600, JUMP = 900;
const SKY: Record<string, [string, string, string]> = {
  emberwick: ['#1b1440', '#6b3a6e', '#ffb347'],
  lumenwood: ['#16234d', '#3d5aa8', '#9fd8ff'],
  drift: ['#3a7bd5', '#8fd3ff', '#ff5fa2'],
};

type Thing = { x: number; w: number; h: number; kind: 'chimney' | 'coin'; y?: number; got?: boolean };

export function RunnerRoom({ go }: { go: (s: Screen) => void }) {
  const s = useStore();
  const { leftSec, timeUp } = usePlayMeter('runner');
  const canvas = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'ready' | 'run' | 'over'>('ready');
  const [score, setScore] = useState(0);
  const best = s.runnerBest ?? 0;
  const world = s.profile!.world;
  const jumpRef = useRef<() => void>(() => {});

  const art = s.creature.stage === 'egg' ? WORLDS[world].art?.egg : (WORLDS[world].creatureArt?.[s.creature.stage]?.excited ?? WORLDS[world].creatureArt?.[s.creature.stage]?.happy);

  useEffect(() => {
    const c = canvas.current!.getContext('2d')!;
    const img = new Image();
    if (art) img.src = art;
    const [top, mid, glow] = SKY[world] ?? SKY.drift;
    let raf = 0, lastT = 0, dist = 0, coins = 0, speed = 360, spawn = 0, scroll = 0;
    let y = GROUND, vy = 0, jumps = 0, alive = phase === 'run';
    const things: Thing[] = [];
    const stars = Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: Math.random() * 200, r: Math.random() * 1.6 + 0.4 }));
    const P = 70; // player size

    jumpRef.current = () => {
      if (!alive) return;
      if (jumps < 2) { vy = -JUMP * (jumps ? 0.85 : 1); jumps++; play('nudge'); }
    };

    const draw = () => {
      const g = c.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, top); g.addColorStop(0.7, mid); g.addColorStop(1, glow);
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.fillStyle = 'rgba(255,255,255,0.8)';
      for (const st of stars) { c.beginPath(); c.arc((st.x - scroll * 0.05 + W * 10) % W, st.y, st.r, 0, 7); c.fill(); }
      // far skyline
      c.fillStyle = 'rgba(20,16,50,0.45)';
      for (let i = 0; i < 14; i++) { const bx = ((i * 97 - scroll * 0.25) % (W + 100) + W + 100) % (W + 100) - 100; const bh = 80 + ((i * 53) % 90); c.fillRect(bx, GROUND - bh + 20, 70, bh); }
      // rooftop
      c.fillStyle = '#2b2346'; c.fillRect(0, GROUND, W, H - GROUND);
      c.fillStyle = '#463a6e';
      for (let i = 0; i < 20; i++) { const tx = ((i * 60 - scroll) % W + W) % W; c.fillRect(tx, GROUND + 4, 40, 6); }
      for (const t of things) {
        if (t.kind === 'chimney') {
          c.fillStyle = '#8c4a3a'; c.fillRect(t.x, GROUND - t.h, t.w, t.h);
          c.fillStyle = '#6b3528'; c.fillRect(t.x - 5, GROUND - t.h, t.w + 10, 12);
        } else if (!t.got) {
          c.fillStyle = '#ffd34d'; c.beginPath(); c.arc(t.x, t.y!, 13, 0, 7); c.fill();
          c.fillStyle = '#ffef9e'; c.beginPath(); c.arc(t.x - 3, t.y! - 3, 5, 0, 7); c.fill();
        }
      }
      // player
      const px = 120, py = y - P;
      if (img.complete && img.naturalWidth) c.drawImage(img, px - 10, py - 10, P + 20, P + 20);
      else { c.fillStyle = '#fff'; c.beginPath(); c.arc(px + P / 2, py + P / 2, P / 2, 0, 7); c.fill(); }
      if (!alive) return;
      c.fillStyle = '#fff'; c.font = '600 22px system-ui, sans-serif'; c.textAlign = 'right';
      c.fillText(`${Math.floor(dist / 10) + coins * 10}`, W - 20, 36);
      c.font = '600 15px system-ui, sans-serif'; c.fillText(`🪙 ${coins}`, W - 20, 58);
    };

    const step = (t: number) => {
      const dt = Math.min(0.033, lastT ? (t - lastT) / 1000 : 0);
      lastT = t;
      if (alive) {
        speed = Math.min(820, speed + dt * 9);
        dist += speed * dt; scroll += speed * dt;
        vy += GRAV * dt; y += vy * dt;
        if (y >= GROUND) { y = GROUND; vy = 0; jumps = 0; }
        spawn -= dt;
        if (spawn <= 0) {
          const h = 40 + Math.random() * 60;
          things.push({ x: W + 20, w: 34 + Math.random() * 24, h, kind: 'chimney' });
          if (Math.random() < 0.7) things.push({ x: W + 20 + 17, w: 0, h: 0, kind: 'coin', y: GROUND - h - 60 - Math.random() * 60 });
          if (Math.random() < 0.4) things.push({ x: W + 220, w: 0, h: 0, kind: 'coin', y: GROUND - 40 });
          spawn = Math.max(0.75, 1.6 - speed / 900) + Math.random() * 0.7;
        }
        for (const th of things) th.x -= speed * dt;
        while (things.length && things[0].x < -80) things.shift();
        const px = 120 + 14, pw = P - 28, ptop = y - P + 10;
        for (const th of things) {
          if (th.kind === 'chimney' && px + pw > th.x && px < th.x + th.w && y > GROUND - th.h + 4 && ptop < GROUND) {
            alive = false;
            const final = Math.floor(dist / 10) + coins * 10;
            setScore(final); setPhase('over'); s.recordRunnerScore(final); play('break');
          }
          if (th.kind === 'coin' && !th.got && Math.abs(th.x - (px + pw / 2)) < 34 && Math.abs(th.y! - (y - P / 2)) < 44) { th.got = true; coins++; play('accept'); }
        }
      }
      draw();
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); if (phase === 'run') jumpRef.current(); else if (!timeUp) setPhase('run'); }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [phase, timeUp]);

  return (
    <div className="page runner-room">
      <div className="row between wrap">
        <h1>Sky runner</h1>
        <div className="row wrap">
          {best > 0 && <span className="pill">Best: {best}</span>}
          <span className="pill strong" aria-live="polite">{Math.max(0, Math.floor(leftSec / 60))} min left</span>
          <button className="btn ghost" onClick={() => go('rooms')}>Leave</button>
        </div>
      </div>
      <div className="runner-wrap">
        <canvas ref={canvas} width={W} height={H} className="runner-canvas" onPointerDown={(e) => { e.preventDefault(); if (phase === 'run') jumpRef.current(); }} />
        {phase !== 'run' && (
          <div className="runner-card">
            {phase === 'ready'
              ? <><h2>Ready?</h2><p>Jump over the chimneys and grab the coins. Tap the screen (or press Space) to jump. Tap again in the air for a double jump!</p></>
              : <><h2>{score > best - 1 && score >= best ? 'New best! 🎉' : 'Bonk!'}</h2><p>Score: <strong>{score}</strong>{best ? ` · Best: ${Math.max(best, score)}` : ''}</p></>}
            <button className="btn primary big" autoFocus onClick={() => setPhase('run')}>{phase === 'ready' ? 'Start running' : 'Run again'}</button>
          </div>
        )}
      </div>
      {timeUp && <TimeUpOverlay go={go} />}
    </div>
  );
}
