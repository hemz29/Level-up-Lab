import type { DateKey, Exam, Subject, SubjectKind } from '../types';

/** Lines in a school portions list that are not chapters to study. */
const SKIP = /\b(revision|revise|unit\s*test|test\s*\d|class\s*test|exam(ination)?s?|assessment|worksheet|discussion|activity|activities|project|dictation|oral|viva|practical\s*exam|holiday|homework|syllabus|portions?|subject|marks?|date)\b/i;

/**
 * Turns pasted text (one chapter per line, or comma/semicolon separated) into chapter titles.
 * Strips numbering like "1.", "(a)", "Ch 3 -", "Chapter 4:" and bullets; drops non-chapter lines.
 * Keeps "Ch 7 · South America" style labels readable.
 */
export function parsePortions(text: string): { chapters: string[]; skipped: string[] } {
  const raw = text
    .split(/\r?\n/)
    .flatMap((l) => (l.includes(',') || l.includes(';')) && !/\d+\s*[,;]\s*\d+/.test(l) && l.split(/[,;]/).length > 2 ? l.split(/[,;]/) : [l])
    .map((l) => l.replace(/^[\s\-–—•*·▪●○>]+/, '').trim())
    .filter(Boolean);
  const chapters: string[] = [];
  const skipped: string[] = [];
  const seen = new Set<string>();
  for (const line of raw) {
    let t = line
      .replace(/^\(?[a-z0-9ivx]{1,4}[.)\]]\s+/i, '')                          // 1.  (a)  iv)
      .replace(/^(ch(apter)?|lesson|unit|theme|l)\s*\.?\s*(\d+|[ivx]+)\s*[:.\-–—]?\s*/i, (_m, _w, _x, n) => `Ch ${n} · `)
      .replace(/\s+/g, ' ')
      .replace(/ · $/, '')
      .trim();
    if (t.length < 3 || SKIP.test(t) || !/[a-z]/i.test(t)) { skipped.push(line); continue; }
    t = t.charAt(0).toUpperCase() + t.slice(1);
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    chapters.push(t.slice(0, 120));
  }
  return { chapters, skipped };
}

/** A sensible kind for a new subject, from its name (families can change it). */
export function guessKind(name: string): SubjectKind {
  const n = name.toLowerCase();
  if (/math|algebra|geometry|arith/.test(n)) return 'maths';
  if (/hist|civic|geog|bio|social|evs|environment/.test(n)) return 'memory';
  if (/phys|chem|science/.test(n)) return 'science';
  if (/eng|hindi|kannada|french|tamil|telugu|marathi|sanskrit|german|spanish|lang|lit/.test(n)) return 'language';
  return 'other';
}

const PALETTE = ['#e07a5f', '#c9a227', '#3d9970', '#6ab04c', '#4a90d9', '#9b59b6', '#16a085', '#d35400', '#c0392b', '#e84393', '#f39c12', '#2c7be5'];
export function nextColor(used: string[]): string {
  return PALETTE.find((c) => !used.includes(c)) ?? PALETTE[used.length % PALETTE.length];
}

/**
 * Exams drive the plan: each subject's test date is the earliest upcoming exam that includes it,
 * and an exam covering every subject sets the overall test date.
 */
export function applyExams(subjects: Subject[], exams: Exam[], today: DateKey): { subjects: Subject[]; globalTestDate?: DateKey } {
  const upcoming = exams.filter((e) => e.date >= today).sort((a, b) => (a.date < b.date ? -1 : 1));
  const covers = (e: Exam, id: string) => e.subjectIds === 'all' || e.subjectIds.includes(id);
  return {
    subjects: subjects.map((s) => ({ ...s, testDate: upcoming.find((e) => covers(e, s.id))?.date })),
    globalTestDate: upcoming.find((e) => e.subjectIds === 'all')?.date,
  };
}
