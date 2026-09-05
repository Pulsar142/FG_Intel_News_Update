# FIGHTER GROUP INTEL / NEWS UPDATE

An open-source military intelligence briefing site: weekly, bot-drafted articles on defence and
military-technology developments across Singapore, South-East Asia, the USA and the world (with
Malaysia and Indonesia as toggleable regions, plus ad-hoc "any country" generation), reviewed and
published through an admin panel.

Built with Next.js 16 (App Router), Tailwind CSS v4, Prisma + SQLite, and the Claude API.

## Local setup

```bash
npm install
cp .env.example .env   # then fill in real secrets (see below) — a working dev default is already in .env
npm run db:migrate     # creates prisma/dev.db and applies the schema
npm run db:seed        # seeds real example articles (Singapore, Malaysia, Indonesia, Global, USA)
npm run dev
```

Visit `http://localhost:3000` — dev defaults (change before sharing this instance with anyone):

- Site password: `viewer-dev-password`
- Admin panel (`/admin`): `admin-dev-password`

## Environment variables

See `.env.example`. In short:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite file path (swap for a Postgres URL in production if you like — update the Prisma datasource provider too) |
| `SITE_PASSWORD` | Shared password that unlocks the public site |
| `ADMIN_PASSWORD` | Password for `/admin` |
| `SESSION_SECRET` | Signs session cookies — generate with `openssl rand -base64 32` |
| `CRON_SECRET` | Required `Authorization: Bearer <secret>` header on the weekly cron endpoint |
| `ANTHROPIC_API_KEY` | Needed for real article generation (Admin → Generate, and the weekly cron). Without it, generation calls fail with a clear error but the rest of the site works fine off the seeded data. |

## How it works

- **Public site** (`/`) — a "This Week's Briefing" roundup at the top, region tabs (Singapore, SEA,
  Global, USA, plus Malaysia/Indonesia if enabled), and an Archive sidebar grouped by month → week.
  Each article (`/article/[slug]`) has 1-2 images, a two-paragraph in-depth summary, a "Did You
  Know?" callout, a Singapore/RSAF-perspective callout, sources with a reliability badge, and a
  "Quick Brief" button (hover or tap) that pops up a 3-5 point summary.
- **Access** — a single shared password, or a shareable invite link (`/login?invite=<token>`,
  managed from Admin → Sources & Settings). Either sets the same session cookie.
- **Admin panel** (`/admin`, separate password) —
  - **Pending Review**: drafts awaiting Publish / Regenerate / Edit / Discard.
  - **Published**: what's live; "Generate replacement" drafts a fresh alternative for that
    region — publishing it automatically archives whatever it's replacing, so this is how you
    swap a briefing even after it's already published.
  - **Generate**: manually trigger the pipeline for any region, or type a country name under
    "Custom" for an ad-hoc briefing (this is also how Malaysia/Indonesia get generated).
  - **Sources & Settings**: toggle Malaysia/Indonesia's visibility on the public site, see the
    curated source list (edit `lib/sources.ts` to change it), and manage invite links.
- **Generation pipeline** (`lib/`) — `fetchCandidates.ts` pulls recent, keyword-filtered headlines
  from the curated sources (best-effort RSS discovery; sources without a feed just contribute
  nothing rather than failing the run); `crossCheck.ts` scores reliability by looking for
  topically-similar headlines from other outlets; `generateArticle.ts` calls the Claude API
  (`claude-sonnet-5`) with a structured-output schema to write the article in-house-style, grounded
  in the fetched source text; `weeklyRun.ts` orchestrates a full weekly cycle across every enabled
  region.
- **Weekly automation** — `vercel.json` schedules `GET /api/cron/weekly-generate` for
  `0 1 * * 1` (Monday 01:00 UTC = 09:00 Singapore time), guarded by `CRON_SECRET`. It generates one
  draft per enabled region and auto-publishes them, archiving the prior week — matching the
  "auto generated and published, weekly, Monday 9am SGT" requirement. Admin review/regenerate/swap
  still works on top of this at any time.

## Deploying (Vercel)

1. Push this repo to GitHub and import it into Vercel.
2. Set the environment variables above in the Vercel project settings (a fresh, real
   `SESSION_SECRET`/`CRON_SECRET`, your own passwords, and `ANTHROPIC_API_KEY`).
3. Vercel Cron auto-adds the `Authorization: Bearer $CRON_SECRET` header for the schedule defined
   in `vercel.json` — no extra setup needed there. The cron function is configured for
   `maxDuration: 300` (5 min) since it makes several sequential Claude API + fetch calls; confirm
   your plan supports that duration (Hobby is capped lower).
4. SQLite (`dev.db`) is fine for a low-traffic demo but is **not** durable on Vercel's serverless
   filesystem across deploys — for real production use, point `DATABASE_URL` at a hosted Postgres
   (e.g. Vercel Postgres / Neon) and change `provider = "sqlite"` to `"postgresql"` in
   `prisma/schema.prisma`, then re-run `prisma migrate dev` once locally against that database
   before deploying.

Not tied to Vercel specifically — any Node host works for the app itself; you'd just need your own
scheduler (e.g. a plain `cron` job or GitHub Actions) hitting `/api/cron/weekly-generate` with the
`CRON_SECRET` header on the same schedule.

## Notes on scope

- The style/template (two-paragraph summary, "Did You Know?", region-appropriate perspective
  section, 3-5 bullet quick-brief) was reverse-engineered from two real past newsletters the admin
  supplied ("Gryphon News Update" Jan 2026, "Bucc Corner News Update" Feb 2026) — see
  `lib/generateArticle.ts` for the house-style prompt.
- The seed data in `prisma/seed.ts` reuses the real stories from those two newsletters (reformatted
  into the app's schema) so the site launches with genuine, on-topic content instead of
  lorem-ipsum placeholders.
- Real government security-classification banners ("OFFICIAL (CLOSED)", "UNCLASSIFIED") from the
  original newsletters were deliberately **not** reproduced here, since this app is reachable via a
  shared password/invite link rather than a controlled internal system — reproducing them could
  misrepresent AI-generated public content as an official classified document.
