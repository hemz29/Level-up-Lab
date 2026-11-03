# Level-Up Lab

_Formerly "Raaga's Study Companion" in the PRD._

A laptop-first, installable web app (PWA) that helps school kids build a consistent, careful study habit on their own. It was first built for Raaga (Grade 6, ICSE). Each child builds their own plan and studies from their own books. The app is the coach and the game layer: finished study blocks and an honest written log grow a magical creature and earn play time in creative rooms.

**The app does not teach content.** It makes her show up, focus, work carefully and remember.

## What's in v1

| Area | What it does |
| --- | --- |
| First run | Greets the child by name, they pick who gets their report (Mum, Dad, Amma…) and a world (Emberwick Academy, Lumenwood Sanctuary, The Drift Isles), and receive an egg |
| Plan builder | 10 subjects with chapters, In portion / Probably / Not in portion, test dates, an auto-spread draft plan (max 3 blocks/day, Maths daily, memory-subject revision touches, light language touches, Sunday boss fight), drag-to-adjust (moved blocks survive a re-spread), and a read-only or printable "Want Mum to take a look?" view |
| Daily session | Recall quiz if due, then pick up to 3 blocks (free swaps), a detective briefing before practice blocks, 25-min focus timer (pause allowed, abandoning doesn't count), 5-min breaks, then wrap-up |
| The gate | 5 takeaways per block (3 on a light day), each ≥ 6 words with a concrete anchor (name, number/year, place, "because", unit, or a chapter key term). No pasting, no repeats or near-duplicates. Gentle creature coaching when a point is vague. Exercise-type log. Optional "Quiz me on this" with their own Q&A |
| Mistake log | Five categories (config file), a note of at least 5 words, bonus play time and GP (capped), rare cosmetics, and a "which slip costs you most" notebook |
| Recall | Spaced intervals of 1, 3, 7 and 21 days. Their own questions or auto fill-in-the-blank. Answer first, then self-rate Got it / Nearly / Missed it. Memory-heavy subjects are weighted higher |
| Creature | Egg → Hatchling → Juvenile → Teen → Adult → Mythic via Growth Points. Hatches after the first 2 gated blocks with a full crack-and-reveal sequence. Trait wheel. A 5-of-7 rolling consistency window. Missed days only make it sleepy, and GP is never lost |
| Rewards | 15 min base + bonus block + mistakes + strong recall, with a 40 min daily ceiling and 1-day carry-over. The art studio opens at hatch (brushes, palette, undo/redo, gallery, pin to home, replace the creature art per stage with their drawings) |
| Light days, swaps, pause | 1 light-day token per week (unused week → bonus GP), avoidance nudge after 3 swaps away from a subject, PIN-protected parent pause, exam-week light-day setting |
| Report | "Tell Mum how today went": the child sees the exact text, can add a note, and it's emailed to the signed-in parent. Unsent reports make the creature sleepy and it reminds them |
| Worksheets | Printable Practice Worksheets, 25-mark Unit Tests and 80-mark Half-yearly/Annual papers built from question banks written from the school textbook (page-referenced answer keys, outline-map questions, scores). See [docs/WORKSHEETS.md](docs/WORKSHEETS.md) |
| Accounts | Parent email sign-in with a code, several children per family, cloud sync with offline support, admin usage dashboard, weekly "is it helping?" check-in, account deletion |
| Data | Saved to the family's account and on the device. JSON backup/restore and CSV exports in the parent area. No ads, third-party analytics, web fonts or AI |

Phase-2 rooms (music corner, chess, runner) appear as locked teasers.

## Accounts and privacy model

- **Parents sign in** with their email and a 6-digit code (no passwords). Children never need an email.
- One parent account can have **up to 6 children**. Each child's progress is saved to the cloud (Supabase), so it's there on any device, and it's also kept on the device so it works offline.
- **Admins** (emails in `ADMIN_EMAILS`) get a dashboard of **usage numbers only**: study days, minutes, consistency, recall improvement, mistakes by type, creature stage, and weekly "is it helping?" answers. Database rules stop anyone, admins included, from reading another family's notes or drawings through the app.
- Parents can delete a child or their whole account any time (Parent → Account).
- Without Supabase settings the app runs in **local mode**: one child, saved on that device only.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173 (local mode unless VITE_SUPABASE_* are set in .env.local)
npm test           # rules-engine unit tests (vitest)
npm run build      # typecheck + production build with service worker
```

## Deploy

1. **Vercel**: import this repo (framework Vite; defaults are fine).
2. **Supabase + email**: follow [docs/ACCOUNTS_SETUP.md](docs/ACCOUNTS_SETUP.md) to create the database, enable code sign-in, and add the environment variables.
3. Redeploy. Each push to `main` redeploys automatically.

Server functions in `api/`:
- `send-report`: emails the report to the **signed-in parent's own address** (never an address from the request), max 5 a day.
- `admin-stats`: numbers for the admin dashboard, admins only.
- `delete-account`: permanently deletes the parent and all their children's data.

## App stores

See [docs/APP_STORES.md](docs/APP_STORES.md) for store naming, keywords, kids-category rules, and how to wrap the PWA for Google Play and the App Store.

## Tuning

All game numbers (GP values, stage thresholds, play-time scale, recall intervals, block lengths, mistake categories, exercise types) are in [`src/config/config.json`](src/config/config.json). Change them after the trial week and redeploy.

## Chapter lists

`src/data/subjects.json` is currently a **draft** based on the typical ICSE Grade 6 syllabus. See [docs/SEED_DATA.md](docs/SEED_DATA.md) to replace it with Raaga's actual textbook contents. The parent area can also edit chapters in-app.

## Project layout

```
api/                    Vercel functions: send-report, admin-stats, delete-account
src/engine/             Pure TypeScript rules engine (tested): takeaways, recall, planner, rewards, creature, report
src/store/              Zustand store persisted to IndexedDB + derived selectors
src/screens/            Sign-in, Setup, Home, Plan, Session, Report, Rooms, Art, Notebook, Parent, Admin
supabase/schema.sql     Database tables + security rules
src/components/         Creature art, celebration, trait wheel, mistake logger, PIN gate…
src/config/config.json  Every tunable value
src/data/subjects.json  Subjects and chapters (draft)
src/data/questions/     Chapter question banks (from the textbook) for worksheets
src/data/maps/          Outline maps (Natural Earth, public domain)
docs/                   Seed-data workflow and the manual test script
```

## Privacy

No ads, no third-party analytics or fonts, no AI. Families' notes and drawings are private to their account. The team sees usage numbers only. See [public/privacy.html](public/privacy.html), and **replace `CONTACT_EMAIL_HERE` before inviting other families**.
