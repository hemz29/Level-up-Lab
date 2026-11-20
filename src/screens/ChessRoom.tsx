import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import { useStore } from '../store';
import { usePlayMeter } from '../lib/usePlayMeter';
import { play } from '../lib/sound';
import { Bubble } from '../components/Bubble';
import { Creature } from '../components/Creature';
import { TimeUpOverlay } from '../components/TimeUpOverlay';
import type { Level } from '../engine/chessAi';
import type { Screen } from '../App';

const GLYPH: Record<string, string> = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
const FILES = 'abcdefgh';
const LEVELS: { id: Level; label: string }[] = [{ id: 'easy', label: 'Easy' }, { id: 'medium', label: 'Medium' }, { id: 'hard', label: 'Hard' }];
const SAVE_KEY = 'lul-chess-game';

function loadGame(): { fen: string; level: Level } | null {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null'); } catch { return null; }
}

export function ChessRoom({ go }: { go: (s: Screen) => void }) {
  const s = useStore();
  const { leftSec, timeUp } = usePlayMeter('chess');
  const saved = useMemo(loadGame, []);
  const game = useRef(new Chess(saved?.fen));
  const [fen, setFen] = useState(game.current.fen());
  const [level, setLevel] = useState<Level>(saved?.level ?? 'easy');
  const [sel, setSel] = useState<Square | null>(null);
  const [last, setLast] = useState<{ from: string; to: string } | null>(null);
  const [thinking, setThinking] = useState(false);
  const [say, setSay] = useState(saved ? 'Welcome back! Your game is just as you left it.' : "Let's play! You're white, so you go first. Tap a piece, then tap where it should go.");
  const worker = useRef<Worker | null>(null);
  const reqId = useRef(0);
  const name = s.creature.name ?? 'Your creature';
  const g = game.current;

  useEffect(() => {
    const w = new Worker(new URL('../engine/chessWorker.ts', import.meta.url), { type: 'module' });
    worker.current = w;
    return () => w.terminate();
  }, []);
  useEffect(() => { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ fen, level })); } catch { /* private mode */ } }, [fen, level]);

  const over = g.isGameOver();
  const status = g.isCheckmate() ? (g.turn() === 'w' ? `Checkmate. ${name} wins this one!` : 'Checkmate! You win! 🏆')
    : g.isStalemate() ? 'Stalemate: nobody can move, so it is a draw.'
      : g.isDraw() ? "It's a draw." : g.inCheck() ? (g.turn() === 'w' ? 'You are in check! Protect your king.' : 'Check!') : '';

  useEffect(() => {
    if (g.isCheckmate()) { play(g.turn() === 'b' ? 'sparkle' : 'break'); if (g.turn() === 'b') s.recordChessWin(level); }
  }, [fen]); // eslint-disable-line react-hooks/exhaustive-deps

  const creatureMove = () => {
    if (!worker.current || g.isGameOver()) return;
    setThinking(true);
    const id = ++reqId.current;
    const startFen = g.fen();
    worker.current.onmessage = (e: MessageEvent<{ id: number; move: { from: string; to: string; promotion?: string } | null }>) => {
      if (e.data.id !== reqId.current || g.fen() !== startFen) return;
      setThinking(false);
      if (!e.data.move) return;
      const m = g.move(e.data.move);
      setLast({ from: m.from, to: m.to });
      setFen(g.fen());
      play(m.captured ? 'accept' : 'nudge');
      setSay(m.captured ? `${name} took your ${pieceName(m.captured)}!` : g.inCheck() ? `${name} says: check!` : pick(['Hmm, your turn.', 'Your move!', 'I like that square.', 'What will you do now?']));
    };
    setTimeout(() => worker.current?.postMessage({ fen: startFen, level, id }), 350);
  };

  const tap = (sq: Square) => {
    if (thinking || over || g.turn() !== 'w') return;
    const piece = g.get(sq);
    if (sel) {
      const legal = g.moves({ square: sel, verbose: true }).find((m) => m.to === sq);
      if (legal) {
        const m = g.move({ from: sel, to: sq, promotion: 'q' });
        setSel(null); setLast({ from: m.from, to: m.to }); setFen(g.fen());
        play(m.captured ? 'accept' : 'nudge');
        if (m.captured) setSay(`Nice! You took ${name}'s ${pieceName(m.captured)}.`);
        if (!g.isGameOver()) creatureMove();
        return;
      }
    }
    setSel(piece?.color === 'w' ? sq : null);
  };

  const targets = new Set(sel ? g.moves({ square: sel, verbose: true }).map((m) => m.to) : []);
  const checkSq = g.inCheck() ? findKing(g, g.turn()) : null;
  const board = g.board();

  const newGame = () => { reqId.current++; g.reset(); setFen(g.fen()); setSel(null); setLast(null); setThinking(false); setSay('New game! You go first.'); };
  const takeBack = () => {
    reqId.current++; setThinking(false);
    if (g.turn() === 'b') g.undo(); else { g.undo(); g.undo(); }
    setFen(g.fen()); setSel(null); setLast(null); setSay('Okay, try a different move.');
  };
  const captured = (color: 'w' | 'b') => {
    const start: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
    for (const row of board) for (const p of row) if (p && p.color === color && p.type !== 'k') start[p.type]--;
    return Object.entries(start).flatMap(([t, n]) => Array(Math.max(0, n)).fill(GLYPH[t])).join('');
  };

  return (
    <div className="page chess-room">
      <div className="row between wrap">
        <h1>Chess with {name}</h1>
        <div className="row wrap">
          <span className="pill strong" aria-live="polite">{Math.max(0, Math.floor(leftSec / 60))} min left</span>
          <button className="btn ghost" onClick={() => go('rooms')}>Leave</button>
        </div>
      </div>
      <div className="chess-layout">
        <div className="chess-side">
          <div className="row">
            <Creature stage={s.creature.stage} world={s.profile!.world} mood="happy" size={110} cosmetics={s.creature.cosmetics} customArtId={s.creature.customArt[s.creature.stage]} />
            <Bubble>{thinking ? `${name} is thinking…` : status || say}</Bubble>
          </div>
          <div className="seg" aria-label="How hard">
            {LEVELS.map((l) => <button key={l.id} className={level === l.id ? 'on' : ''} onClick={() => setLevel(l.id)}>{l.label}</button>)}
          </div>
          <div className="row wrap">
            <button className="btn" onClick={takeBack} disabled={g.history().length === 0}>↩ Take back</button>
            <button className="btn" onClick={newGame}>New game</button>
          </div>
          <p className="small muted">You captured: <span className="captured">{captured('b') || '—'}</span></p>
          <p className="small muted">{name} captured: <span className="captured white">{captured('w') || '—'}</span></p>
          {(s.chessWins ?? 0) > 0 && <p className="small">🏆 Games won against {name}: <strong>{s.chessWins}</strong></p>}
        </div>
        <div className="chess-board" role="grid" aria-label="Chess board">
          {board.map((row, r) => row.map((p, f) => {
            const sq = `${FILES[f]}${8 - r}` as Square;
            const dark = (r + f) % 2 === 1;
            const cls = ['sq', dark ? 'dark' : 'light', sel === sq ? 'sel' : '', last && (last.from === sq || last.to === sq) ? 'last' : '', checkSq === sq ? 'check' : ''].join(' ');
            return (
              <button key={sq} className={cls} onClick={() => tap(sq)} aria-label={`${sq}${p ? ` ${p.color === 'w' ? 'white' : 'black'} ${pieceName(p.type)}` : ''}`}>
                {p && <span className={`pc ${p.color}`}>{GLYPH[p.type]}</span>}
                {targets.has(sq) && <span className={p ? 'hint-cap' : 'hint-dot'} />}
                {f === 0 && <span className="coord rank">{8 - r}</span>}
                {r === 7 && <span className="coord file">{FILES[f]}</span>}
              </button>
            );
          }))}
        </div>
      </div>
      {timeUp && <TimeUpOverlay go={go} />}
    </div>
  );
}

function findKing(g: Chess, color: 'w' | 'b'): Square | null {
  const b = g.board();
  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) { const p = b[r][f]; if (p?.type === 'k' && p.color === color) return `${FILES[f]}${8 - r}` as Square; }
  return null;
}
const pieceName = (t: string) => ({ p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' })[t] ?? t;
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
