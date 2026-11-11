import { describe, expect, it } from 'vitest';
import { initialState } from '../store';
import type { AppState } from '../types';
import { dailySeries, notebook, paperSeries, trendDirection } from './trends';

const s: AppState = {
  ...initialState(),
  blocks: {
    a: { id: 'a', date: '2026-11-09', subjectId: 'geography', type: 'learn', startedAt: '2026-11-09T11:00:00Z', minutes: 25, takeawayIds: ['t1'], exerciseTypes: ['Read the chapter'], completedGate: true, extra: false },
    b: { id: 'b', date: '2026-11-10', subjectId: 'maths', type: 'practice', startedAt: '2026-11-10T11:00:00Z', minutes: 15, takeawayIds: [], exerciseTypes: [], completedGate: true, extra: false },
  },
  takeaways: { t1: { id: 't1', blockId: 'a', subjectId: 'geography', date: '2026-11-09', text: 'Angel Falls is 979 m high', intervalStep: 1, nextDue: '2026-11-13', history: [{ date: '2026-11-10', rating: 'got' }] } },
  sessions: {
    '2026-11-10': { date: '2026-11-10', selected: [], blockIds: ['b'], lightDay: false, recall: [{ takeawayId: 't1', prompt: '', answer: '', kind: 'cloze', rating: 'got' }], recallDone: true, recallScore: 1, reportSent: false, briefingsDone: 0, swaps: [], playEarned: 0, gpEarned: 0 },
  },
  papers: [
    { id: 'p2', specId: 'unit-test', title: 'Unit Test', subject: 'Geography', bankIds: [], seed: 2, marks: 25, createdAt: '2026-11-10T10:00:00Z', score: 20 },
    { id: 'p1', specId: 'unit-test', title: 'Unit Test', subject: 'Geography', bankIds: [], seed: 1, marks: 25, createdAt: '2026-11-08T10:00:00Z', score: 15 },
    { id: 'p3', specId: 'practice', title: 'Practice', subject: 'Geography', bankIds: [], seed: 3, marks: 22, createdAt: '2026-11-10T12:00:00Z' },
  ],
};

describe('trends', () => {
  it('builds a daily series with minutes and recall', () => {
    const d = dailySeries(s, '2026-11-10', 7);
    expect(d).toHaveLength(7);
    expect(d.at(-2)).toMatchObject({ date: '2026-11-09', minutes: 25, takeaways: 1, recall: null });
    expect(d.at(-1)).toMatchObject({ date: '2026-11-10', minutes: 15, recall: 1 });
  });
  it('lists scored papers in date order', () => {
    expect(paperSeries(s).map((p) => p.pct)).toEqual([0.6, 0.8]);
  });
  it('detects direction', () => {
    expect(trendDirection([0.4, 0.5, 0.7, 0.8])).toBe('up');
    expect(trendDirection([0.5, 0.5, 0.52, 0.5])).toBe('flat');
    expect(trendDirection([0.5])).toBeNull();
  });
  it('keeps every block summary in the notebook, newest first', () => {
    const n = notebook(s);
    expect(n.map((b) => b.blockId)).toEqual(['b', 'a']);
    expect(n[1].takeaways[0]).toMatchObject({ text: 'Angel Falls is 979 m high', lastRating: 'got', mastered: false });
  });
});
