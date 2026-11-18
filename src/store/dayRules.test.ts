import { describe, expect, it } from 'vitest';
import type { AppState, BlockLog } from '../types';
import { useStore, snapshot } from './index';
import { blocksRequired, dayPlayInput, roomsOpen } from './dayRules';
import { computeDayPlay } from '../engine/rewards';
import { config } from '../config';

const D = '2026-11-18';
function withBlocks(n: number, lightDay = false): AppState {
  useStore.getState().resetAll();
  const s = snapshot();
  const blocks: Record<string, BlockLog> = {};
  for (let i = 0; i < n; i++) blocks[`b${i}`] = { id: `b${i}`, date: D, completedGate: true } as unknown as BlockLog;
  return { ...s, blocks, sessions: { [D]: { date: D, selected: [], blockIds: Object.keys(blocks), lightDay, recallDone: false, reportSent: false, briefingsDone: 0, swaps: [], playEarned: 0, gpEarned: 0 } } };
}

describe('rooms open after the day\'s blocks', () => {
  it('needs 3 blocks normally, 1 on a light day, and no recall quiz', () => {
    expect(config.blocks.roomsAfterBlocks).toBe(3);
    expect(roomsOpen(withBlocks(2), D)).toBe(false);
    expect(roomsOpen(withBlocks(3), D)).toBe(true);
    expect(blocksRequired(withBlocks(0, true), D)).toBe(1);
    expect(roomsOpen(withBlocks(1, true), D)).toBe(true);
  });
  it('gives base play time at 3 blocks and a bonus for a 4th', () => {
    expect(computeDayPlay(dayPlayInput(withBlocks(2), D)).total).toBe(0);
    const three = computeDayPlay(dayPlayInput(withBlocks(3), D)).total;
    expect(three).toBe(config.playTime.baseMinutes);
    expect(computeDayPlay(dayPlayInput(withBlocks(4), D)).total).toBeGreaterThan(three);
  });
  it('maths blocks are 25 minutes', () => expect(config.blocks.mathsPracticeMinutes).toBe(25));
});
