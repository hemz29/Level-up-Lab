/**
 * Question banks are written from the school's textbook pages, one file per chapter.
 * Every item carries the page it comes from, so answer keys can say where to look.
 * Questions and passages are written fresh from the chapter's facts (not copied text).
 */
export type QType = 'mcq' | 'fill' | 'name' | 'define' | 'match' | 'reason' | 'difference' | 'short' | 'long' | 'passage';

interface Base {
  id: string;
  page: number | number[];
  /** Items sharing a topic test the same fact; a paper uses at most one of them so answers aren't given away. */
  topic?: string;
}

export interface McqQ extends Base { type: 'mcq'; q: string; options: [string, string, string, string]; correct: 0 | 1 | 2 | 3 }
export interface FillQ extends Base { type: 'fill'; q: string; answer: string } // q contains one or more "_____"
export interface NameQ extends Base { type: 'name'; q: string; answer: string }
export interface DefineQ extends Base { type: 'define'; term: string; answer: string }
export interface MatchQ extends Base { type: 'match'; q: string; left: string; right: string; pairs: [string, string][] }
export interface ReasonQ extends Base { type: 'reason'; q: string; answer: string }
export interface DifferenceQ extends Base { type: 'difference'; a: string; b: string; rows: [string, string][] }
export interface ShortQ extends Base { type: 'short'; q: string; answer: string; marks: 2 | 3 }
export interface LongQ extends Base { type: 'long'; q: string; answer: string; marks: 4 | 5 }
export interface PassageQ extends Base { type: 'passage'; text: string; parts: { q: string; answer: string; marks: number }[] }

export type BankQuestion = McqQ | FillQ | NameQ | DefineQ | MatchQ | ReasonQ | DifferenceQ | ShortQ | LongQ | PassageQ;

export interface MapFeature {
  id: string;
  name: string;
  kind: 'ocean' | 'sea' | 'strait' | 'mountain' | 'peak' | 'plateau' | 'highland' | 'lowland' | 'river' | 'lake' | 'waterfall' | 'desert' | 'grassland' | 'island' | 'isthmus' | 'cape' | 'line' | 'city' | 'region';
  lat: number;
  lon: number;
  where: string; // answer-key hint for "mark and name"
  identify: boolean; // a single dot makes sense for "identify the letter" questions
  page: number | number[];
}

export interface ChapterBank {
  id: string;
  subjectId: string;
  subject: string;
  grade: number;
  chapter: string;
  pages: string;
  map?: 'south-america';
  questions: BankQuestion[];
  mapFeatures: MapFeature[];
}
