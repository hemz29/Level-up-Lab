import { describe, expect, it } from 'vitest';
import { initialState } from '../store';
import type { AppState, BlockLog } from '../types';
import { computeStats } from './stats';

const blk = (id: string, date: string, minutes = 25): BlockLog => ({
  id, date, subjectId: 'maths', type: 'learn', startedAt: '', minutes, takeawayIds: [], exerciseTypes: [], completedGate: true, extra: false,
});

describe('admin stats', () => {
  const s: AppState = {
    ...initialState(),
    profile: { name: 'Kid', world: 'drift', createdAt: '2026-10-01T10:00:00Z', parentLabel: 'Mum' },
    blocks: { a: blk('a', '2026-10-01'), b: blk('b', '2026-10-20'), c: blk('c', '2026-10-27', 15), d: blk('d', '2026-10-27') },
    takeaways: {
      t1: { id: 't1', blockId: 'a', subjectId: 'maths', date: '2026-10-01', text: 'SECRET WRITING', intervalStep: 0, nextDue: null,
        history: [{ date: '2026-10-02', rating: 'missed' }, { date: '2026-10-26', rating: 'got' }] },
    },
    mistakes: [{ id: 'm', date: '2026-10-27', subjectId: 'maths', category: 'operator', note: 'SECRET NOTE here and there' }],
  };
  const st = computeStats(s, '2026-10-28');
  it('counts study days and minutes', () => {
    expect(st.totalStudyDays).toBe(3);
    expect(st.studyDays7).toBe(1);
    expect(st.studyDays30).toBe(3);
    expect(st.totalMinutes).toBe(90);
    expect(st.minutes7).toBe(40);
  });
  it('tracks recall improvement', () => {
    expect(st.recallGotRateFirstWeek).toBe(0);
    expect(st.recallGotRateLast7).toBe(1);
  });
  it('never includes the child\'s writing', () => {
    const json = JSON.stringify(st);
    expect(json).not.toContain('SECRET');
    expect(st.mistakesByCategory).toEqual({ operator: 1 });
  });
});
