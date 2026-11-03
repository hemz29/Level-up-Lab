import type { ChapterBank } from './types';
import { ch7SouthAmerica } from './geography/ch7-south-america';

/** Every chapter with a question bank. Add new chapters here (see docs/WORKSHEETS.md). */
export const BANKS: ChapterBank[] = [ch7SouthAmerica];

export function banksBySubject(): { subjectId: string; subject: string; banks: ChapterBank[] }[] {
  const out = new Map<string, { subjectId: string; subject: string; banks: ChapterBank[] }>();
  for (const b of BANKS) {
    if (!out.has(b.subjectId)) out.set(b.subjectId, { subjectId: b.subjectId, subject: b.subject, banks: [] });
    out.get(b.subjectId)!.banks.push(b);
  }
  return [...out.values()];
}
