# Setting up accounts (Supabase) and email (Resend)

About 20 minutes, one time. You'll create a free Supabase project, run one SQL file, and add a few settings in Vercel.

## 1. Create the Supabase project

1. Go to **https://supabase.com**, sign up (Continue with GitHub is easiest), then **New project**.
   - Name: `level-up-lab`
   - Database password: generate one and save it somewhere safe (you won't need it day to day)
   - Region: the one closest to your families (e.g. **Mumbai (ap-south-1)** for India)
2. Wait about 2 minutes for it to start.

## 2. Create the tables

1. In the left sidebar open **SQL Editor** → **New query**.
2. Open [`supabase/schema.sql`](../supabase/schema.sql) from this repo, copy everything, paste it in, and click **Run**. You should see "Success. No rows returned".

This creates the tables and the security rules. Those rules mean each parent can only reach their own children's data, and the admin dashboard only ever reads the numbers table.

## 3. Turn on email sign-in

1. **Authentication → Sign In / Providers → Email**: make sure **Email** is enabled.
2. **Authentication → URL Configuration**:
   - **Site URL**: your main Vercel address, e.g. `https://raaga-s-study-companion.vercel.app`
   - **Redirect URLs**: add the same address (and any custom domain you add later).

No email-template changes are needed: parents get Supabase's default email and **click its link** ("Log In" / "Confirm your email") on the device they're using. If you later set up custom SMTP (step 4) and add `{{ .Token }}` to the templates, the app also accepts the 6-digit code.

## 4. Send emails through Resend (needed for other families)

Out of the box, Supabase sends only a few sign-in emails per hour, and Resend's test sender only delivers to your own address. To let **other parents** sign in and receive reports, you need a domain you own:

1. Buy a domain (any registrar, typically ₹700 to ₹1,000 a year), e.g. `levelup-lab.in`.
2. In **Resend → Domains → Add domain**, add it and copy the DNS records it shows into your registrar. Wait for **Verified**.
3. In **Supabase → Project Settings → Authentication → SMTP Settings** (or **Authentication → Emails → SMTP**), enable custom SMTP:
   - Host `smtp.resend.com`, Port `465`, Username `resend`, Password: your Resend API key
   - Sender email `hello@your-domain`, Sender name `Level-Up Lab`
4. Optional: in Vercel → **Settings → Domains**, add `app.your-domain` so families get a nicer web address. Then update the Supabase Site URL to match.

Until you do this, everything still works for **your own** account, so you can try it with Raaga first.

## 5. Add the settings in Vercel

**Vercel → your project → Settings → Environment Variables.** Remove the old `PARENT_EMAIL`, `REPORT_SHARED_SECRET` and `VITE_REPORT_SHARED_SECRET`, then add:

| Key | Where to find the value |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase → Project Settings → **API** (or **Data API**) → Project URL |
| `VITE_SUPABASE_ANON_KEY` | same page → **anon / public** key |
| `SUPABASE_SERVICE_ROLE_KEY` | same page → **service_role** key (secret! never share it, and never add `VITE_` to its name) |
| `ADMIN_EMAILS` | your email address (comma-separate several admins) |
| `RESEND_API_KEY` | your Resend key (already there) |
| `REPORT_FROM_EMAIL` | `Level-Up Lab <hello@your-domain>` once your domain is verified (leave empty until then) |

Then **Deployments → ⋯ → Redeploy**.

## 6. Try it

1. Open the site and enter your email. Enter the code from the email, tick the consent box, and add Raaga.
2. Do one block, then open the site on another device or browser. Sign in and pick Raaga: her progress is there.
3. On the "Who's studying today?" screen (or **Parent → Account**) you'll see **Admin dashboard**, because your email is in `ADMIN_EMAILS`.

## Good to know

- **Free tier:** Supabase's free plan covers hundreds of families. Free projects pause after a week with no activity; any visit wakes them, but the first load after a pause is slow. Upgrade ($25/month) if many families depend on it.
- **One device at a time:** if the same child studies on two devices at the same moment, the last one saved wins. That's fine for normal use.
- **Without the Supabase settings,** the app runs in "local mode": one child, saved on that device only. This is handy for development.
