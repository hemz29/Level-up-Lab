import type { BankQuestion, ChapterBank, MapFeature, QType } from '../data/questions/types';
import papersConfig from '../config/papers.json';

/* ---------- paper layouts ---------- */

export type QuestionSpec =
  | { kind: 'pick'; types: QType[]; heading: string; count: number; marksEach: number }
  | { kind: 'match'; heading: string; count: number; marksEach: number }
  | { kind: 'map'; mode: 'mark' | 'identify'; heading: string; count: number; marksEach: number }
  | { kind: 'structured'; heading: string; count: number; marks: number };

export interface SectionSpec { title: string; questions: QuestionSpec[] }
export interface PaperSpec { id: string; title: string; minutes: number | null; answerSpace: boolean; sections: SectionSpec[] }

export function paperSpecs(): PaperSpec[] {
  const layouts = papersConfig.layouts as Record<string, SectionSpec[]>;
  return papersConfig.papers.map((p) => ({
    ...p,
    sections: typeof p.sections === 'string' ? layouts[p.sections.slice(1)] : (p.sections as SectionSpec[]),
  })) as PaperSpec[];
}

export const specMarks = (q: QuestionSpec) => (q.kind === 'structured' ? q.count * q.marks : q.count * q.marksEach);
export const paperSpecMarks = (p: PaperSpec) => p.sections.reduce((a, s) => a + s.questions.reduce((b, q) => b + specMarks(q), 0), 0);

/* ---------- generated paper ---------- */

export interface PaperItem {
  label: string; // (a), (b)…
  text: string;
  marks: number;
  options?: string[];
  table?: [string, string][]; // difference answer rows
  lines: number; // answer lines when printing with answer space
  answer: string;
  source: string; // "Ch 7 · South America, p. 124"
  topic?: string;
}

export interface MapTask {
  mode: 'mark' | 'identify';
  features: (MapFeature & { letter?: string })[];
}

export interface PaperQuestion {
  number: number;
  heading: string;
  marks: number;
  items: PaperItem[];
  passage?: string;
  match?: { leftTitle: string; rightTitle: string; left: string[]; right: string[] };
  map?: MapTask;
}

export interface PaperSection { title: string; marks: number; questions: PaperQuestion[] }

export interface Paper {
  specId: string;
  title: string;
  subject: string;
  chapters: string[];
  minutes: number | null;
  answerSpace: boolean;
  seed: number;
  marks: number;
  sections: PaperSection[];
  warnings: string[];
}

/* ---------- helpers ---------- */

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(list: T[], rand: () => number): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
const label = (i: number) => `(${LETTERS[i]})`;
const pages = (p: number | number[]) => (Array.isArray(p) ? `pp. ${p.join(', ')}` : `p. ${p}`);

interface Tagged { q: BankQuestion; chapter: string }

function marksOf(q: BankQuestion): number {
  switch (q.type) {
    case 'reason': case 'difference': return 2;
    case 'short': case 'long': return q.marks;
    case 'passage': return q.parts.reduce((a, p) => a + p.marks, 0);
    default: return 1;
  }
}

function toItem(t: Tagged, i: number, marks: number, mixed: boolean): PaperItem {
  const { q, chapter } = t;
  const source = `${chapter}, ${pages(q.page)}`;
  const base = { label: label(i), marks, source, topic: q.topic ? `${chapter}:${q.topic}` : undefined };
  switch (q.type) {
    case 'mcq':
      return { ...base, text: q.q, options: q.options.map((o, k) => `(${ROMAN[k]}) ${o}`), lines: 0, answer: `(${ROMAN[q.correct]}) ${q.options[q.correct]}` };
    case 'fill':
      return { ...base, text: q.q, lines: 0, answer: q.answer };
    case 'name':
      return { ...base, text: mixed ? `Name: ${lowerFirst(q.q)}.` : q.q, lines: 1, answer: q.answer };
    case 'define':
      return { ...base, text: q.term, lines: 2, answer: q.answer };
    case 'reason':
      return { ...base, text: mixed ? `Give a reason: ${q.q}` : q.q, lines: 3, answer: q.answer };
    case 'difference':
      return { ...base, text: `Distinguish between ${q.a} and ${q.b}.`, table: [[cap(q.a), cap(q.b)], ...q.rows], lines: 4, answer: q.rows.map(([a, b]) => `${a} | ${b}`).join('\n') };
    case 'short':
      return { ...base, text: q.q, lines: q.marks === 3 ? 5 : 4, answer: q.answer };
    case 'long':
      return { ...base, text: q.q, lines: 9, answer: q.answer };
    case 'match':
    case 'passage':
      throw new Error('handled separately');
  }
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/* ---------- generator ---------- */

/**
 * Builds a paper from the chosen chapters' question banks, following a layout.
 * Same banks + layout + seed always give the same paper, so it can be reprinted.
 */
export function generatePaper(spec: PaperSpec, banks: ChapterBank[], seed: number): Paper {
  const rand = rng(seed);
  const warnings: string[] = [];
  const used = new Set<string>();
  const pool: Tagged[] = shuffle(banks.flatMap((b) => b.questions.map((q) => ({ q: { ...q, id: `${b.id}:${q.id}` }, chapter: b.chapter }))), rand);
  const features = shuffle(banks.flatMap((b) => b.mapFeatures.map((f) => ({ ...f, id: `${b.id}:${f.id}` }))), rand);
  const usedFeatures = new Set<string>();

  const usedTopics = new Set<string>();
  const take = (pred: (t: Tagged) => boolean, n: number): Tagged[] => {
    const out: Tagged[] = [];
    for (const t of pool) {
      if (out.length >= n) break;
      const topic = t.q.topic ? `${t.chapter}:${t.q.topic}` : null;
      if (used.has(t.q.id) || (topic && usedTopics.has(topic)) || !pred(t)) continue;
      out.push(t);
      used.add(t.q.id);
      if (topic) usedTopics.add(topic);
    }
    return out;
  };

  let number = 0;
  let identifyMap: MapTask | undefined;
  const sections: PaperSection[] = spec.sections.map((sec) => {
    const questions: PaperQuestion[] = [];
    for (const qs of sec.questions) {
      if (qs.kind === 'pick') {
        const picked = take((t) => qs.types.includes(t.q.type) && marksOf(t.q) === qs.marksEach, qs.count);
        if (picked.length < qs.count) warnings.push(`Only ${picked.length} of ${qs.count} questions for "${qs.heading}". Add more chapters for a full paper.`);
        if (!picked.length) continue;
        const mixed = qs.types.length > 1;
        questions.push({
          number: ++number, heading: qs.heading, marks: picked.length * qs.marksEach,
          items: picked.map((t, i) => toItem(t, i, qs.marksEach, mixed)),
        });
      } else if (qs.kind === 'match') {
        const [m] = take((t) => t.q.type === 'match' && t.q.pairs.length >= qs.count, 1);
        if (!m || m.q.type !== 'match') { warnings.push('No match-the-following set available.'); continue; }
        const pairs = shuffle(m.q.pairs, rand).slice(0, qs.count);
        const right = shuffle(pairs.map((p) => p[1]), rand);
        questions.push({
          number: ++number, heading: `${qs.heading} ${m.q.q}`, marks: pairs.length * qs.marksEach,
          match: { leftTitle: m.q.left, rightTitle: m.q.right, left: pairs.map((p) => p[0]), right },
          items: pairs.map((p, i) => ({
            label: label(i), text: p[0], marks: qs.marksEach, lines: 0,
            answer: `(${LETTERS[i]}) ${p[0]} – (${ROMAN[right.indexOf(p[1])]}) ${p[1]}`, source: `${m.chapter}, ${pages(m.q.page)}`,
          })),
        });
      } else if (qs.kind === 'map') {
        const candidates = features.filter((f) => !usedFeatures.has(f.id) && (qs.mode === 'mark' || f.identify));
        const chosen = candidates.slice(0, qs.count);
        chosen.forEach((f) => usedFeatures.add(f.id));
        if (chosen.length < qs.count) warnings.push(`Only ${chosen.length} map features available for "${qs.heading}".`);
        if (!chosen.length) continue;
        const map: MapTask = { mode: qs.mode, features: chosen.map((f, i) => (qs.mode === 'identify' ? { ...f, letter: 'ABCDEFGHIJ'[i] } : f)) };
        const q: PaperQuestion = {
          number: ++number, heading: qs.heading, marks: chosen.length * qs.marksEach,
          items: map.features.map((f, i) => ({
            label: qs.mode === 'identify' ? `${f.letter}` : label(i),
            text: qs.mode === 'identify' ? '' : f.name,
            marks: qs.marksEach, lines: 0,
            answer: qs.mode === 'identify' ? `${f.letter}: ${f.name}` : `${f.name}: ${f.where}`,
            source: `${banks.find((b) => f.id.startsWith(`${b.id}:`))?.chapter ?? ''}, ${pages(f.page)}`,
          })),
        };
        // a "mark" task after an "identify" task uses the same printed map (and adds no dots to it)
        if (qs.mode === 'identify') { identifyMap = map; q.map = map; }
        else if (!identifyMap) q.map = map;
        questions.push(q);
      } else {
        for (let k = 0; k < qs.count; k++) {
          const q = structured(qs.marks, take, k);
          if (!q) { warnings.push(`Ran out of questions for Section B question ${k + 1}. Add more chapters for a full paper.`); break; }
          questions.push({ ...q, number: ++number });
        }
      }
    }
    return { title: sec.title, marks: questions.reduce((a, q) => a + q.marks, 0), questions };
  });

  const chapters = banks.map((b) => b.chapter);
  return {
    specId: spec.id, title: spec.title, subject: banks[0]?.subject ?? '', chapters,
    minutes: spec.minutes, answerSpace: spec.answerSpace, seed,
    marks: sections.reduce((a, s) => a + s.marks, 0), sections, warnings,
  };
}

function structured(marks: number, take: (pred: (t: Tagged) => boolean, n: number) => Tagged[], index: number): Omit<PaperQuestion, 'number'> | null {
  // one passage-based question per paper (as question 1 of the section), if a passage fits exactly
  if (index === 0) {
    const [p] = take((t) => t.q.type === 'passage' && marksOf(t.q) === marks, 1);
    if (p && p.q.type === 'passage') {
      return {
        heading: 'Read the passage and answer the questions that follow.', marks, passage: p.q.text,
        items: p.q.parts.map((part, i) => ({ label: label(i), text: part.q, marks: part.marks, lines: part.marks * 2, answer: part.answer, source: `${p.chapter}, ${pages(p.q.page)}`, topic: p.q.topic && i === 0 ? `${p.chapter}:${p.q.topic}` : undefined })),
      };
    }
  }
  // otherwise: a long answer + a 2-mark part, or three 2-mark parts
  const parts: Tagged[] = [];
  const [long] = take((t) => t.q.type === 'long' && t.q.marks === marks - 2, 1);
  if (long) parts.push(long);
  const need = long ? 1 : Math.floor(marks / 2);
  parts.push(...take((t) => (t.q.type === 'short' && t.q.marks === 2) || t.q.type === 'difference', need));
  const total = parts.reduce((a, t) => a + marksOf(t.q), 0);
  if (total !== marks) return null;
  return { heading: '', marks, items: parts.map((t, i) => toItem(t, i, marksOf(t.q), true)) };
}

export function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}
