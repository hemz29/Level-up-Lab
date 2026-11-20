import { chooseMove, type Level } from './chessAi';

self.onmessage = (e: MessageEvent<{ fen: string; level: Level; id: number }>) => {
  const m = chooseMove(e.data.fen, e.data.level);
  (self as unknown as Worker).postMessage({ id: e.data.id, move: m ? { from: m.from, to: m.to, promotion: m.promotion } : null });
};
