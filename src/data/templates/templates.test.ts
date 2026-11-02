import { describe, expect, it } from 'vitest';
import { subjectsFromTemplate, TEMPLATES } from './index';

describe('portions templates', () => {
  it('builds subjects with every chapter in portion and unique ids', () => {
    for (const t of TEMPLATES) {
      const subjects = subjectsFromTemplate(t);
      const ids = subjects.flatMap((s) => s.chapters.map((c) => c.id));
      expect(new Set(ids).size).toBe(ids.length);
      expect(subjects.every((s) => s.chapters.length > 0 && s.chapters.every((c) => c.portionStatus === 'in'))).toBe(true);
      expect(subjects.flatMap((s) => s.chapters).some((c) => /revision|unit test|discussion/i.test(c.title))).toBe(false);
    }
  });
});
