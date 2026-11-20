import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import { chooseMove } from './chessAi';

describe('creature chess', () => {
  it('always returns a legal move', () => {
    const g = new Chess();
    g.move('e4');
    const m = chooseMove(g.fen(), 'medium');
    expect(m && g.moves().includes(m.san)).toBe(true);
  });
  it('takes a free queen on medium', () => {
    // white queen hangs on d5, black knight on f6 can take it
    const g = new Chess('rnbqkb1r/pppppppp/5n2/3Q4/8/8/PPPP1PPP/RNB1KBNR b KQkq - 0 3');
    expect(chooseMove(g.fen(), 'medium')?.san).toBe('Nxd5');
  });
  it('finds mate in one on hard', () => {
    // back-rank mate: Black rook a8 to a1
    expect(chooseMove('r5k1/8/8/8/8/8/5PPP/6K1 b - - 0 1', 'hard')?.san).toBe('Ra1#');
  });
});
