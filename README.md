# WeeklyPickEm

Pick winners in NFL, ACC, SEC, and Big Ten football leagues. Compete weekly and climb the season leaderboard.

## Features

- User auth: sign up (name, email, username), login, password reset
- Leagues: create or join public/private leagues
- Multi-sport: NFL, ACC, SEC, Big Ten
- Cross-conference games appear in any league where either team belongs to that conference
- ESPN API integration for schedules and live scores
- Daily 10am email reminders for NFL members with outstanding picks
- Weekly leaderboard (1 point per correct pick)
- Season leaderboard (weekly wins; ties for 1st all count as a win)
- Admin panel for leagues, players, and picks

## Tech Stack

- Next.js 16 (App Router)
- PostgreSQL + Prisma
- iron-session + bcrypt

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

The app uses port **5433** to avoid conflicting with a local PostgreSQL install on port 5432.

### 2. Configure environment

Copy `.env.example` to `.env` and update values as needed.

### 3. Run migrations

```bash
npm run db:migrate
```

### 4. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Admin access

Set `ADMIN_EMAILS` in `.env` to a comma-separated list of admin email addresses. Users who register with those emails receive admin privileges.

## Email

Emails are sent through [Resend](https://resend.com). Without `RESEND_API_KEY` nothing is sent —
messages (including password reset links) are logged to the server console instead, so local
development works without an account.

## Pick Reminders

Members of an NFL league who haven't submitted all of their picks for the current week get an
email at **10:00am Eastern** reminding them, with a link straight to that week's picks. Reminders
only go out while picks are open and the deadline is within `REMINDER_LEAD_DAYS` days, they skip
anyone who has already submitted, and each member is emailed at most once per league, per week,
per day.

The job lives at `/api/cron/pick-reminders` and is scheduled by `vercel.json`. Vercel cron runs in
UTC only, so the path is scheduled at 14:00 and 15:00 UTC; the endpoint sends during whichever run
lands on 10:00 Eastern and exits immediately on the other, which keeps the time correct across
daylight saving.

| Variable | Purpose |
|----------|---------|
| `CRON_SECRET` | Required in production. Vercel sends it as `Authorization: Bearer <CRON_SECRET>`; requests without it are rejected. |
| `REMINDER_TIMEZONE` | IANA timezone for the 10am send. Defaults to `America/New_York`. |
| `REMINDER_LEAD_DAYS` | Only remind when the deadline is this close. Defaults to `3`. |

Admins can also trigger a run from the **Admin Dashboard → Pick Reminders**, or call the endpoint
directly (`force=1` bypasses the 10am check):

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "http://localhost:3000/api/cron/pick-reminders?force=1"
```

## Deploy to Vercel + Neon

### 1. Create a Neon database

1. Sign up at [neon.tech](https://neon.tech) and create a project.
2. Copy both connection strings from the dashboard:
   - **Pooled** → `DATABASE_URL` (hostname includes `-pooler`)
   - **Direct** → `DIRECT_URL` (used for migrations during build)

### 2. Deploy on Vercel

1. Push this repo to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Add these environment variables in Vercel **before** the first deploy:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Neon **pooled** connection string |
| `DIRECT_URL` | Neon **direct** connection string |
| `SESSION_SECRET` | Random string, at least 32 characters |
| `ADMIN_EMAILS` | Your admin email(s), comma-separated |
| `APP_URL` | Your Vercel URL, e.g. `https://weeklypickem.vercel.app` |
| `CRON_SECRET` | Random string, at least 16 characters (secures the pick reminder cron) |

4. Deploy. The build runs `prisma migrate deploy` automatically to set up the schema.

### 3. Custom domain (optional)

In Vercel → Project → Settings → Domains, add your domain and follow the DNS instructions. Then update `APP_URL` to match.

### 4. Email (optional)

Sign up at [resend.com](https://resend.com), verify your domain, and add `RESEND_API_KEY` and `EMAIL_FROM` in Vercel. Password resets and pick reminders both need this to actually send.
