import { describe, expect, it } from 'vitest';
import type { Subject } from '../types';
import { applyExams, guessKind, parsePortions } from './curriculum';

describe('portions parser', () => {
  it('splits lines, strips numbering and skips non-chapters', () => {
    const { chapters, skipped } = parsePortions(`
      Geography – Unit Test 2 Portions
      1. South America
      Ch 5: Minerals
      Chapter 3 - The Cell
      • Revision of Test 1
      (a) Digestive system
      Discussion in class
      South America
    `);
    expect(chapters).toEqual(['South America', 'Ch 5 · Minerals', 'Ch 3 · The Cell', 'Digestive system']);
    expect(skipped.join('|')).toMatch(/Revision/);
    expect(skipped.join('|')).toMatch(/Discussion/);
  });
  it('accepts a comma-separated list', () => {
    expect(parsePortions('Fractions, Decimals, Ratio and Proportion').chapters).toEqual(['Fractions', 'Decimals', 'Ratio and Proportion']);
  });
  it('keeps titles that only look like numbers lists', () => {
    expect(parsePortions('Lesson 4 Ninnallu adbutha shakti ede').chapters).toEqual(['Ch 4 · Ninnallu adbutha shakti ede']);
  });
});

describe('subject kind guess', () => {
  it('guesses from the name', () => {
    expect(guessKind('Mathematics')).toBe('maths');
    expect(guessKind('History & Civics')).toBe('memory');
    expect(guessKind('Kannada')).toBe('language');
    expect(guessKind('Art')).toBe('other');
  });
});

describe('exams drive test dates', () => {
  const subs = [{ id: 'maths' }, { id: 'geo' }] as Subject[];
  it('uses the earliest upcoming exam per subject and an all-subject exam for the overall date', () => {
    const r = applyExams(subs, [
      { id: 'a', name: 'Annual', date: '2027-03-01', subjectIds: 'all' },
      { id: 'u', name: 'Unit test 2', date: '2026-11-20', subjectIds: ['geo'] },
      { id: 'old', name: 'Unit test 1', date: '2026-09-01', subjectIds: 'all' },
    ], '2026-11-13');
    expect(r.subjects.map((s) => s.testDate)).toEqual(['2027-03-01', '2026-11-20']);
    expect(r.globalTestDate).toBe('2027-03-01');
  });
});
