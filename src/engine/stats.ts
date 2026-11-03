import type { AppState, DateKey } from '../types';
import { addDays } from './dates';
import { consistency } from './creature';

/** Numbers only, never the child's writing. This is everything the admin dashboard can see. */
export interface ChildStats {
  startedOn: DateKey | null;
  lastActive: DateKey | null;
  studyDays7: number;
  studyDays30: number;
  totalStudyDays: number;
  totalBlocks: number;
  totalMinutes: number;
  minutes7: number;
  takeaways: number;
  mistakesCaught: number;
  mistakesByCategory: Record<string, number>;
  briefingsDone: number;
  recallReviews: number;
  recallGotRateFirstWeek: number | null;
  recallGotRateLast7: number | null;
  consistencyActive: number;
  consistencyRequired: number;
  stage: string;
  gp: number;
  reportsSent: number;
  lightDaysUsed: number;
  planDays: number;
  papersCreated: number;
  papersScored: number;
  avgPaperScore: number | null; // 0..1
}

export function computeStats(s: AppState, today: DateKey): ChildStats {
  const blocks = Object.values(s.blocks).filter((b) => b.completedGate);
  const days = [...new Set(blocks.map((b) => b.date))].sort();
  const inLast = (n: number) => days.filter((d) => d > addDays(today, -n) && d <= today).length;
  const reviews = Object.values(s.takeaways).flatMap((t) => t.history).sort((a, b) => (a.date < b.date ? -1 : 1));
  const rate = (list: typeof reviews) => (list.length ? Math.round((list.filter((r) => r.rating === 'got').length / list.length) * 100) / 100 : null);
  const firstReview = reviews[0]?.date;
  const mistakesByCategory: Record<string, number> = {};
  s.mistakes.forEach((m) => { mistakesByCategory[m.category] = (mistakesByCategory[m.category] ?? 0) + 1; });
  const startedOn = s.profile?.createdAt.slice(0, 10) ?? null;
  const c = consistency(today, new Set(days), new Set(s.settings.pausedDays), startedOn ?? today);
  const sessions = Object.values(s.sessions);
  const scored = (s.papers ?? []).filter((p) => typeof p.score === 'number' && p.marks > 0);
  return {
    startedOn,
    lastActive: days.at(-1) ?? null,
    studyDays7: inLast(7),
    studyDays30: inLast(30),
    totalStudyDays: days.length,
    totalBlocks: blocks.length,
    totalMinutes: blocks.reduce((a, b) => a + b.minutes, 0),
    minutes7: blocks.filter((b) => b.date > addDays(today, -7)).reduce((a, b) => a + b.minutes, 0),
    takeaways: Object.keys(s.takeaways).length,
    mistakesCaught: s.mistakes.length,
    mistakesByCategory,
    briefingsDone: sessions.reduce((a, x) => a + x.briefingsDone, 0),
    recallReviews: reviews.length,
    recallGotRateFirstWeek: firstReview ? rate(reviews.filter((r) => r.date < addDays(firstReview, 7))) : null,
    recallGotRateLast7: rate(reviews.filter((r) => r.date > addDays(today, -7))),
    consistencyActive: c.active,
    consistencyRequired: c.required,
    stage: s.creature.stage,
    gp: s.creature.gp,
    reportsSent: sessions.filter((x) => x.reportSent).length,
    lightDaysUsed: sessions.filter((x) => x.lightDay).length,
    planDays: Object.keys(s.plan.days).length,
    papersCreated: (s.papers ?? []).length,
    papersScored: scored.length,
    avgPaperScore: scored.length ? Math.round((scored.reduce((a, p) => a + p.score! / p.marks, 0) / scored.length) * 100) / 100 : null,
  };
}
