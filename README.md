# WeeklyPickEm

Pick winners in NFL, ACC, SEC, and Big Ten football leagues. Compete weekly and climb the season leaderboard.

## Features

- User auth: sign up (name, email, username), login, password reset
- Leagues: create or join public/private leagues
- Multi-sport: NFL, ACC, SEC, Big Ten
- Cross-conference games appear in any league where either team belongs to that conference
- ESPN API integration for schedules and live scores
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

## Password Reset

In development, reset links are logged to the server console. For production, set `RESEND_API_KEY` and `EMAIL_FROM`.
