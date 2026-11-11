import type { AppState, DateKey } from '../types';
import { addDays, range } from './dates';
import { recallScore } from './recall';

export interface DayPoint {
  date: DateKey;
  minutes: number;
  blocks: number;
  takeaways: number;
  mistakes: number;
  recall: number | null; // 0..1
}

export interface PaperPoint { date: DateKey; title: string; subject: string; pct: number; score: number; marks: number }

/** One point per day for the last `days` days (days without study have zero minutes). */
export function dailySeries(s: AppState, today: DateKey, days = 28): DayPoint[] {
  return range(addDays(today, -(days - 1)), days).map((date) => {
    const session = s.sessions[date];
    const blocks = Object.values(s.blocks).filter((b) => b.date === date && b.completedGate);
    const recall = session?.recallDone && session.recall?.length
      ? session.recallScore ?? recallScore(session.recall)
      : null;
    return {
      date,
      minutes: blocks.reduce((a, b) => a + b.minutes, 0),
      blocks: blocks.length,
      takeaways: blocks.reduce((a, b) => a + b.takeawayIds.length, 0),
      mistakes: s.mistakes.filter((m) => m.date === date).length,
      recall,
    };
  });
}

export function paperSeries(s: AppState): PaperPoint[] {
  return (s.papers ?? [])
    .filter((p) => typeof p.score === 'number' && p.marks > 0)
    .map((p) => ({ date: p.createdAt.slice(0, 10), title: p.title, subject: p.subject, score: p.score!, marks: p.marks, pct: p.score! / p.marks }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/** Average of the first half vs the second half: is it going up? */
export function trendDirection(values: number[]): 'up' | 'down' | 'flat' | null {
  if (values.length < 4) return null;
  const mid = Math.floor(values.length / 2);
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const d = avg(values.slice(mid)) - avg(values.slice(0, mid));
  return Math.abs(d) < 0.05 ? 'flat' : d > 0 ? 'up' : 'down';
}

export interface NoteBlock {
  blockId: string;
  date: DateKey;
  subjectId: string;
  chapterId?: string;
  minutes: number;
  exerciseTypes: string[];
  exerciseNote?: string;
  takeaways: { id: string; text: string; ownQuestion?: string; ownAnswer?: string; mastered: boolean; lastRating?: string }[];
}

/** Every logged block with its takeaways, newest first: her notebook of what she learnt. */
export function notebook(s: AppState): NoteBlock[] {
  return Object.values(s.blocks)
    .filter((b) => b.completedGate)
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
    .map((b) => ({
      blockId: b.id, date: b.date, subjectId: b.subjectId, chapterId: b.chapterId, minutes: b.minutes,
      exerciseTypes: b.exerciseTypes, exerciseNote: b.exerciseNote,
      takeaways: b.takeawayIds.map((id) => s.takeaways[id]).filter(Boolean).map((t) => ({
        id: t.id, text: t.text, ownQuestion: t.ownQuestion, ownAnswer: t.ownAnswer,
        mastered: t.nextDue === null, lastRating: t.history.at(-1)?.rating,
      })),
    }));
}
