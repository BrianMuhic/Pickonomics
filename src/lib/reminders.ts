import { LeagueType } from "@/generated/prisma/client";
import { currentSeasonYear } from "@/lib/constants";
import { formatGameDateTime, GAME_TIMEZONE } from "@/lib/datetime";
import { appUrl, escapeHtml, sendEmails, type EmailMessage } from "@/lib/email";
import {
  canMakePicks,
  ensurePickDeadline,
  getCurrentWeekFromGames,
  getLeagueGames,
  getSeasonGamesForLeague,
} from "@/lib/games";
import { prisma } from "@/lib/prisma";

/** Local hour reminders go out, in REMINDER_TIMEZONE. */
export const REMINDER_HOUR = 10;

/** Only nudge once the deadline is this close, so nobody gets emailed all week. */
const DEFAULT_LEAD_DAYS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

export function reminderTimezone() {
  return process.env.REMINDER_TIMEZONE || GAME_TIMEZONE;
}

function reminderLeadDays() {
  const configured = Number(process.env.REMINDER_LEAD_DAYS);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_LEAD_DAYS;
}

function zonedHour(date: Date, timeZone: string) {
  // en-GB is a 0–23 locale, so midnight formats as "00" rather than "24".
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    hour12: false,
  }).format(date);
  return parseInt(hour, 10) % 24;
}

/** Calendar day in the reminder timezone, formatted YYYY-MM-DD. */
export function zonedDayKey(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Vercel cron only fires in UTC, so the endpoint is scheduled for both UTC
 * hours that can be 10am locally and this check discards the wrong one.
 */
export function isReminderHour(date: Date) {
  return zonedHour(date, reminderTimezone()) === REMINDER_HOUR;
}

export type LeagueReminderResult = {
  leagueId: string;
  leagueName: string;
  week: number | null;
  sent: number;
  failed: number;
  alreadyReminded: number;
  skipped?: string;
};

export type ReminderRunResult = {
  season: number;
  timezone: string;
  sentOn: string;
  totalSent: number;
  totalFailed: number;
  leagues: LeagueReminderResult[];
};

type ReminderMember = {
  id: string;
  name: string;
  email: string;
};

function buildMessage(args: {
  league: { id: string; name: string };
  member: ReminderMember;
  week: number;
  picksMade: number;
  totalGames: number;
  deadline: Date | null;
}): EmailMessage {
  const { league, member, week, picksMade, totalGames, deadline } = args;
  const leagueUrl = `${appUrl()}/leagues/${league.id}?week=${week}`;
  const progress =
    picksMade === 0
      ? `You haven't made any of your ${totalGames} picks yet.`
      : `You've made ${picksMade} of ${totalGames} picks.`;
  const deadlineLine = deadline
    ? `Picks close ${formatGameDateTime(deadline)}.`
    : "Picks close at the first kickoff of the week.";

  return {
    to: member.email,
    subject: `Week ${week} picks are due — ${league.name}`,
    html: `<p>Hi ${escapeHtml(member.name)},</p>
<p>${progress} ${deadlineLine}</p>
<p><a href="${leagueUrl}">Make your Week ${week} picks</a></p>
<p>Good luck,<br />Pickonomics</p>`,
    text: `Hi ${member.name},

${progress} ${deadlineLine}

Make your Week ${week} picks: ${leagueUrl}

Good luck,
Pickonomics`,
  };
}

async function remindLeague(
  league: {
    id: string;
    name: string;
    leagueType: LeagueType;
    members: { userId: string; user: ReminderMember }[];
  },
  season: number,
  sentOn: string,
  now: Date
): Promise<LeagueReminderResult> {
  const base = {
    leagueId: league.id,
    leagueName: league.name,
    week: null,
    sent: 0,
    failed: 0,
    alreadyReminded: 0,
  };

  if (league.members.length === 0) {
    return { ...base, skipped: "league has no members" };
  }

  const seasonGames = await getSeasonGamesForLeague(league.leagueType, season);
  if (seasonGames.length === 0) {
    return { ...base, skipped: `no games synced for ${season}` };
  }

  const week = getCurrentWeekFromGames(seasonGames);
  const games = await getLeagueGames(league.leagueType, season, week);
  if (games.length === 0) {
    return { ...base, week, skipped: `no games for week ${week}` };
  }

  const deadline = await ensurePickDeadline(league.id, league.leagueType, season, week);
  if (!(await canMakePicks(league.id, league.leagueType, season, week))) {
    return { ...base, week, skipped: "picks are closed" };
  }
  if (deadline && deadline.getTime() - now.getTime() > reminderLeadDays() * DAY_MS) {
    return { ...base, week, skipped: "deadline is outside the reminder window" };
  }

  const pickCounts = await prisma.pick.groupBy({
    by: ["userId"],
    where: { leagueId: league.id, gameId: { in: games.map((g) => g.id) } },
    _count: { _all: true },
  });
  const picksByUser = new Map(pickCounts.map((row) => [row.userId, row._count._all]));

  const pending = league.members
    .map((m) => ({ member: m.user, picksMade: picksByUser.get(m.userId) ?? 0 }))
    .filter((m) => m.picksMade < games.length);

  if (pending.length === 0) {
    return { ...base, week, skipped: "everyone has submitted their picks" };
  }

  const alreadySent = await prisma.pickReminder.findMany({
    where: {
      leagueId: league.id,
      week,
      season,
      sentOn,
      userId: { in: pending.map((p) => p.member.id) },
    },
    select: { userId: true },
  });
  const alreadySentIds = new Set(alreadySent.map((r) => r.userId));
  const recipients = pending.filter((p) => !alreadySentIds.has(p.member.id));

  if (recipients.length === 0) {
    return { ...base, week, alreadyReminded: alreadySentIds.size, skipped: "already reminded today" };
  }

  const userIdByEmail = new Map(recipients.map((r) => [r.member.email, r.member.id]));
  const { sent, failed } = await sendEmails(
    recipients.map((r) =>
      buildMessage({
        league,
        member: r.member,
        week,
        picksMade: r.picksMade,
        totalGames: games.length,
        deadline,
      })
    )
  );

  await prisma.pickReminder.createMany({
    data: sent.flatMap((message) => {
      const userId = userIdByEmail.get(message.to);
      return userId ? [{ leagueId: league.id, userId, week, season, sentOn }] : [];
    }),
    skipDuplicates: true,
  });

  return {
    ...base,
    week,
    sent: sent.length,
    failed: failed.length,
    alreadyReminded: alreadySentIds.size,
  };
}

/**
 * Emails every member of the given league types who still has incomplete picks
 * for the current week. Safe to call more than once a day: sends are recorded
 * per league, week and calendar day, and repeat runs are no-ops.
 */
export async function sendWeeklyPickReminders(
  options: { leagueTypes?: LeagueType[]; now?: Date } = {}
): Promise<ReminderRunResult> {
  const leagueTypes = options.leagueTypes ?? [LeagueType.NFL];
  const now = options.now ?? new Date();
  const season = currentSeasonYear();
  const timezone = reminderTimezone();
  const sentOn = zonedDayKey(now, timezone);

  const leagues = await prisma.league.findMany({
    where: { leagueType: { in: leagueTypes } },
    select: {
      id: true,
      name: true,
      leagueType: true,
      members: {
        select: {
          userId: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const results: LeagueReminderResult[] = [];
  for (const league of leagues) {
    try {
      results.push(await remindLeague(league, season, sentOn, now));
    } catch (e) {
      console.error(`Pick reminders failed for league ${league.id}:`, e);
      results.push({
        leagueId: league.id,
        leagueName: league.name,
        week: null,
        sent: 0,
        failed: 0,
        alreadyReminded: 0,
        skipped: "errored",
      });
    }
  }

  return {
    season,
    timezone,
    sentOn,
    totalSent: results.reduce((sum, r) => sum + r.sent, 0),
    totalFailed: results.reduce((sum, r) => sum + r.failed, 0),
    leagues: results,
  };
}
