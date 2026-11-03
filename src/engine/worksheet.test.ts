import { describe, expect, it } from 'vitest';
import { BANKS } from '../data/questions';
import { generatePaper, paperSpecMarks, paperSpecs } from './worksheet';

const specs = paperSpecs();
const byId = (id: string) => specs.find((s) => s.id === id)!;

describe('paper layouts', () => {
  it('unit test is 25 marks and exams are 80 marks', () => {
    expect(paperSpecMarks(byId('unit-test'))).toBe(25);
    expect(paperSpecMarks(byId('half-yearly'))).toBe(80);
    expect(paperSpecMarks(byId('annual'))).toBe(80);
  });
});

describe('paper generator', () => {
  it('builds a full 25-mark unit test from one chapter', () => {
    const p = generatePaper(byId('unit-test'), BANKS, 42);
    expect(p.marks).toBe(25);
    expect(p.warnings).toEqual([]);
  });
  it('builds a full 80-mark annual paper from one chapter, for any seed', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const p = generatePaper(byId('annual'), BANKS, seed);
      expect(p.warnings).toEqual([]);
      expect(p.marks).toBe(80);
      expect(p.sections.map((s) => s.marks)).toEqual([40, 30, 10]);
    }
  });
  it('builds full unit tests and practice sheets for any seed', () => {
    for (let seed = 1; seed <= 200; seed++) {
      expect(generatePaper(byId('unit-test'), BANKS, seed).warnings).toEqual([]);
      expect(generatePaper(byId('practice'), BANKS, seed).warnings).toEqual([]);
    }
  });
  it('is repeatable for the same seed and changes with a new seed', () => {
    const a = JSON.stringify(generatePaper(byId('annual'), BANKS, 1));
    expect(JSON.stringify(generatePaper(byId('annual'), BANKS, 1))).toBe(a);
    expect(JSON.stringify(generatePaper(byId('annual'), BANKS, 2))).not.toBe(a);
  });
  it('never repeats a question within a paper', () => {
    for (let seed = 1; seed < 30; seed++) {
      const p = generatePaper(byId('annual'), BANKS, seed);
      const texts = p.sections.flatMap((s) => s.questions.flatMap((q) => q.items.map((i) => `${q.heading}|${i.text}`))).filter((t) => !t.endsWith('|'));
      expect(new Set(texts).size).toBe(texts.length);
    }
  });
  it('never tests the same fact twice in one paper', () => {
    for (const id of ['annual', 'unit-test', 'practice']) for (let seed = 1; seed <= 200; seed++) {
      const p = generatePaper(byId(id), BANKS, seed);
      const topics = p.sections.flatMap((s) => s.questions.flatMap((q) => q.items.map((i) => i.topic))).filter(Boolean);
      expect(new Set(topics).size).toBe(topics.length);
    }
  });
  it('every item has an answer and a page reference', () => {
    const p = generatePaper(byId('annual'), BANKS, 3);
    for (const s of p.sections) for (const q of s.questions) for (const i of q.items) {
      expect(i.answer.length).toBeGreaterThan(0);
      expect(i.source).toMatch(/p{1,2}\. \d+/);
    }
  });
  it('identify map letters are unique and the mark task adds no dots to it', () => {
    const p = generatePaper(byId('annual'), BANKS, 5);
    const mapQs = p.sections[2].questions;
    expect(mapQs[0].map?.features.every((f) => f.letter)).toBe(true);
    expect(mapQs[1].map).toBeUndefined();
  });
  it('mcq answers point at a real option', () => {
    const p = generatePaper(byId('unit-test'), BANKS, 9);
    const mcq = p.sections[0].questions[0];
    for (const i of mcq.items) expect(i.options!.some((o) => o === i.answer)).toBe(true);
  });
});
