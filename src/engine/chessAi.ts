import { Chess, type Move } from 'chess.js';

export type Level = 'easy' | 'medium' | 'hard';
const VALUE: Record<string, number> = { p: 100, n: 310, b: 320, r: 500, q: 900, k: 0 };

/** Small bonus for pieces near the centre and pawns that have advanced. */
function placeBonus(type: string, color: 'w' | 'b', file: number, rank: number): number {
  const centre = 3.5 - Math.max(Math.abs(file - 3.5), Math.abs(rank - 3.5));
  if (type === 'p') return (color === 'w' ? rank : 7 - rank) * 6 + centre * 2;
  if (type === 'n' || type === 'b') return centre * 8;
  if (type === 'q') return centre * 2;
  return 0;
}

/** Score from Black's point of view (the creature plays Black). */
export function evaluate(g: Chess): number {
  if (g.isCheckmate()) return g.turn() === 'b' ? -100000 : 100000;
  if (g.isDraw() || g.isStalemate()) return 0;
  let score = 0;
  const board = g.board();
  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
    const sq = board[r][f];
    if (!sq) continue;
    const v = VALUE[sq.type] + placeBonus(sq.type, sq.color, f, 7 - r);
    score += sq.color === 'b' ? v : -v;
  }
  return score;
}

function ordered(g: Chess): Move[] {
  const ms = g.moves({ verbose: true });
  const key = (m: Move) => (m.captured ? VALUE[m.captured] * 10 - VALUE[m.piece] : 0) + (m.promotion ? 800 : 0);
  return ms.sort((a, b) => key(b) - key(a));
}

function search(g: Chess, depth: number, alpha: number, beta: number): number {
  if (depth === 0 || g.isGameOver()) return evaluate(g);
  const black = g.turn() === 'b';
  let best = black ? -Infinity : Infinity;
  for (const m of ordered(g)) {
    g.move(m);
    const v = search(g, depth - 1, alpha, beta);
    g.undo();
    if (black) { best = Math.max(best, v); alpha = Math.max(alpha, v); } else { best = Math.min(best, v); beta = Math.min(beta, v); }
    if (beta <= alpha) break;
  }
  return best;
}

/** Pick Black's move. Easy is deliberately sloppy so a beginner can win. */
export function chooseMove(fen: string, level: Level, rnd: () => number = Math.random): Move | null {
  const g = new Chess(fen);
  const moves = ordered(g);
  if (!moves.length) return null;
  const depth = level === 'hard' ? 3 : level === 'medium' ? 2 : 1;
  const scored = moves.map((m) => {
    g.move(m);
    const v = search(g, depth - 1, -Infinity, Infinity);
    g.undo();
    return { m, v: v + (level === 'easy' ? rnd() * 250 : rnd() * 10) };
  });
  scored.sort((a, b) => b.v - a.v);
  if (level === 'easy' && rnd() < 0.3) return scored[Math.floor(rnd() * Math.min(4, scored.length))].m;
  return scored[0].m;
}
