import type { Subject, SubjectKind } from '../../types';
import g6NovDec2026 from './g6-nov-dec-2026.json';

/** Ready-made portions lists a family can load in one tap (Parent → Chapter lists). Every chapter starts "In portion". */
export interface PortionsTemplate {
  id: string;
  name: string;
  description: string;
  subjects: { id: string; name: string; kind: string; color: string; chapters: { title: string; weight?: number }[] }[];
}

export const TEMPLATES: PortionsTemplate[] = [g6NovDec2026];

export function subjectsFromTemplate(t: PortionsTemplate): Subject[] {
  return t.subjects.map((s) => ({
    id: s.id,
    name: s.name,
    kind: s.kind as SubjectKind,
    color: s.color,
    chapters: s.chapters.map((c, i) => ({
      id: `${t.id}-${s.id}-${i + 1}`,
      subjectId: s.id,
      number: i + 1,
      title: c.title,
      weight: c.weight ?? 1,
      portionStatus: 'in' as const,
      doneDates: [],
    })),
  }));
}
