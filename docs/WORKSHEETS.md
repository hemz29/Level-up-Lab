# Worksheets & test papers

The **Worksheets** tab builds printable papers from the school's own textbook chapters:

| Paper | Marks | Time | Layout |
| --- | --- | --- | --- |
| Practice Worksheet | 22 | as needed | objective questions, reasons, identify-on-map, with space to write |
| Unit Test | 25 | 45 min | A: MCQ + fill/name (10) · B: short answers (6) + one long answer (4) · C: map work (5) |
| Half-Yearly / Annual | 80 | 2 hours | A: MCQ, fill, name, match, terms, reasons (40) · B: five 6-mark questions incl. a passage (30) · C: identify + mark on map (10) |

The layouts live in [`src/config/papers.json`](../src/config/papers.json) and are **provisional**. Send a real school paper and they'll be changed to match it exactly.

## How it stays grounded

- Each chapter has a **question bank** in `src/data/questions/<subject>/`, written only from the textbook pages. Every item records its page number, and the answer key shows it (e.g. "Ch 7 · South America, p. 124").
- Papers are **assembled** from the bank following the layout: no AI runs in the app, and nothing is made up when a paper is created. Each paper has a seed, so the same paper can be reopened and reprinted; "New version" shuffles in different questions.
- Items that test the same fact share a `topic`, and a paper never uses two of them, so one question can't give away another's answer.
- Questions and passages are written fresh from the chapter's facts. Textbook text is not copied in, so the repo stays free of copyrighted pages.
- Outline maps come from Natural Earth (public domain) via `scripts/make-map.mjs`. Identify questions place lettered dots using each map feature's latitude/longitude.

## Adding a chapter

1. Send photos of the chapter's pages (and its exercises) in a Claude Code session.
2. Claude writes `src/data/questions/<subject>/<chapter>.ts` following `types.ts`. Use [`geography/ch7-south-america.ts`](../src/data/questions/geography/ch7-south-america.ts) as the model, and aim for enough items that an 80-mark paper fills completely (the tests check 200 random papers).
3. Register it in `src/data/questions/index.ts`.
4. Run `npm test`. The generator tests fail if any paper type can't be filled.

Chapters of the same subject can be combined in one paper; Half-yearly and Annual papers normally cover several chapters.

## Scores

After marking a paper (the answer key is behind the parent PIN if one is set), the child records the score. Scores show in "My papers", and the admin dashboard shows papers created and the average score.
