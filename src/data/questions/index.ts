import type { ChapterBank } from './types';
import { ch7SouthAmerica } from './geography/ch7-south-america';
import { ch7Magadha } from './history/ch7-magadha';
import { ch10RuralLsg } from './history/ch10-rural-lsg';

/** Every chapter with a question bank. Add new chapters here (see docs/WORKSHEETS.md). */
export const BANKS: ChapterBank[] = [ch7SouthAmerica, ch7Magadha, ch10RuralLsg];

export function banksBySubject(): { subjectId: string; subject: string; banks: ChapterBank[] }[] {
  const out = new Map<string, { subjectId: string; subject: string; banks: ChapterBank[] }>();
  for (const b of BANKS) {
    if (!out.has(b.subjectId)) out.set(b.subjectId, { subjectId: b.subjectId, subject: b.subject, banks: [] });
    out.get(b.subjectId)!.banks.push(b);
  }
  return [...out.values()];
}
