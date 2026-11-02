# Getting Level-Up Lab onto the App Store and Google Play, and getting found

## 1. Make the name explain itself

On both stores the **title and subtitle are searched most heavily**, so pair the brand with what it does:

| Field | Limit | Suggested |
| --- | --- | --- |
| Apple: App name | 30 | `Level-Up Lab: Study Habits` |
| Apple: Subtitle | 30 | `Homework planner & focus timer` |
| Apple: Keywords (hidden) | 100 | `study,planner,homework,timer,pomodoro,revision,exam,school,kids,focus,ICSE,CBSE,recall,habit` |
| Google Play: Title | 30 | `Level-Up Lab: Study Planner` |
| Google Play: Short description | 80 | `A study-habit coach for school kids: plan, focus, remember, and level up.` |
| Google Play: Full description | 4,000 | Use the phrases parents search for naturally: "study planner for kids", "homework timer", "exam revision", "build a daily study habit", "spaced repetition", "careless mistakes" |

Other things that help:
- **Screenshots** do most of the selling. Lead with the creature hatching, then the plan, the timer, the recall quiz, and the parent report. Put a short caption on each ("Kids plan their own study week").
- **Category:** Education. A short **preview video** (15–30 s) of a day's loop raises installs.
- **Ratings:** ask parents (not children) for a review after a good week, e.g. from the report email.
- Outside the stores, word of mouth matters most: school WhatsApp groups, PTA notes, teachers, tuition centres.

## 2. Kids-category rules (important)

Both stores have strict rules for apps aimed at children. Level-Up Lab is already close: no ads, no third-party analytics, a parent-only sign-in, account deletion, and a privacy notice.

**Apple.** Choose between:
- **Kids Category (age 9–11)**: more visible to parents, but every link out of the app, purchase or email action must sit behind a **parental gate** (e.g. "ask a grown-up to solve 7 × 8"). No third-party analytics or ads at all.
- **Education category, age rating 9+**: simpler to get approved. This is **recommended for the first version**.

**Google Play.** Target audience includes under-13s, so the **Families Policy** applies. You'll fill in the **Data safety** form; declare: email (account), child nickname, app activity, user content (notes, drawings). All are encrypted in transit and deletable, and none are shared or sold. After launch you can apply for the **Teacher Approved** badge, which shows in a special kids tab.

Both need: a public **privacy policy URL** (use `https://<your-site>/privacy.html` after you replace `CONTACT_EMAIL_HERE` in `public/privacy.html`), and **in-app account deletion** (already in Parent → Account).

## 3. Turning the web app into store apps

The app is a PWA, so no rewrite is needed:

| Store | Route | Notes |
| --- | --- | --- |
| **Google Play** | **Trusted Web Activity** via [PWABuilder](https://www.pwabuilder.com) (paste the Vercel URL → Android package) | Easiest. Updates ship automatically when you deploy, with no re-upload. One-time $25 developer fee |
| **Apple App Store** | **Capacitor** wrapper (`@capacitor/ios`) around the same code | Needs a Mac with Xcode and a $99/year Apple Developer account. Apple rejects "just a website in a box" (guideline 4.2), so add native value: **local notifications** for the creature's 4:45 pm nudge (already planned for phase 2) and home-screen widgets later |

Practical order: launch on the web with a few families, then Google Play (fast), then iOS once notifications are in.

## 4. Before submitting, checklist

- [ ] Own domain set up (sign-in emails and reports to other families depend on it; see ACCOUNTS_SETUP.md)
- [ ] `public/privacy.html` contact email filled in
- [ ] Phone layout checked on a real phone (the app is laptop-first today)
- [ ] App icon 1024×1024 and screenshots for phone + tablet
- [ ] Support URL / email
- [ ] Test account for the reviewer: give Apple/Google a test email whose code you can read, or add a reviewer bypass
