/**
 * Question banks are written from the school's textbook pages, one file per chapter.
 * Every item carries the page it comes from, so answer keys can say where to look.
 * Questions and passages are written fresh from the chapter's facts (not copied text).
 */
export type QType = 'mcq' | 'fill' | 'name' | 'define' | 'match' | 'reason' | 'difference' | 'short' | 'long' | 'passage' | 'stimulus' | 'picture';

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
export interface ShortQ extends Base { type: 'short'; q: string; answer: string; marks: 1 | 2 | 3 }
export interface LongQ extends Base { type: 'long'; q: string; answer: string; marks: 4 | 5 }
export interface PassageQ extends Base { type: 'passage'; text: string; parts: { q: string; answer: string; marks: number }[] }

/** "Answer with the help of the given illustration": a bar chart drawn from data, with 1-mark parts. */
export interface StimulusQ extends Base {
  type: 'stimulus';
  title: string;
  yLabel: string;
  bars: { label: string; value: number; note?: string }[];
  source?: string;
  parts: { q: string; answer: string }[];
}

/** Picture study: a picture (an image file once supplied, otherwise its description) with short parts. */
export interface PictureQ extends Base {
  type: 'picture';
  scene: string; // what the picture shows (printed in a frame until an image is added)
  image?: string; // e.g. /pictures/history/coins.webp
  imagePrompt?: string; // prompt for generating an original picture
  parts: { q: string; answer: string; marks: number }[];
}

export type BankQuestion = McqQ | FillQ | NameQ | DefineQ | MatchQ | ReasonQ | DifferenceQ | ShortQ | LongQ | PassageQ | StimulusQ | PictureQ;

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
  /** paper layouts can differ per subject (see config/papers.json → subjects) */
  questions: BankQuestion[];
  mapFeatures: MapFeature[];
}
