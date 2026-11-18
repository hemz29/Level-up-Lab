import type { AppState, DateKey } from '../types';
import { config } from '../config';
import { isValidMistakeNote } from '../engine/insights';
import { recallScore } from '../engine/recall';
import type { DayPlayInput } from '../engine/rewards';

/** Blocks needed before rooms open today: 3 normally (config), 1 on a light day. */
export function blocksRequired(s: AppState, date: DateKey): number {
  return s.sessions[date]?.lightDay ? 1 : config.blocks.roomsAfterBlocks;
}

export function blocksDone(s: AppState, date: DateKey): number {
  const session = s.sessions[date];
  return session ? session.blockIds.filter((id) => s.blocks[id]?.completedGate).length : 0;
}

/** Rooms open once the required blocks are finished and logged. */
export function roomsOpen(s: AppState, date: DateKey): boolean {
  return blocksDone(s, date) >= blocksRequired(s, date) && s.activeBlock?.phase !== 'log';
}

/** Inputs for the play-time scale: base time for the required blocks, bonuses on top. */
export function dayPlayInput(s: AppState, date: DateKey): DayPlayInput {
  const session = s.sessions[date];
  const done = blocksDone(s, date);
  const required = blocksRequired(s, date);
  return {
    plannedCount: required,
    gatedPlanned: Math.min(done, required),
    extraBlocks: Math.max(0, done - required),
    validMistakes: s.mistakes.filter((m) => m.date === date && isValidMistakeNote(m.note)).length,
    recallScore: session?.recallDone && session.recall?.length ? recallScore(session.recall) : null,
    gatePassed: roomsOpen(s, date),
  };
}
