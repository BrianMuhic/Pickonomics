import { LeagueType } from "@/generated/prisma/client";
import { notFound, redirect } from "next/navigation";
import { currentSeasonYear, maxWeeksForLeague } from "@/lib/constants";
import { syncGamesForLeagueType } from "@/lib/espn/sync";
import {
  canMakePicks,
  ensurePickDeadline,
  getCurrentWeekFromGames,
  getLeagueGames,
  getSeasonGamesForLeague,
  sportForLeague,
} from "@/lib/games";
import { prisma } from "@/lib/prisma";
import {
  computeWeeklyScores,
  getWeeklyWinners,
  isWeekCompleteForPickedGames,
} from "@/lib/scoring";
import type { SessionUser } from "@/lib/session";
import {
  getStoredSeasonLeaderboard,
  getStoredWeeklyLeaderboard,
} from "@/lib/weekly-results";

export async function ensureLeagueSeason(league: {
  id: string;
  season: number;
  leagueType: LeagueType;
}): Promise<number> {
  const season = currentSeasonYear();
  if (league.season === season) return season;

  await prisma.league.update({ where: { id: league.id }, data: { season } });
  league.season = season;

  const sport = sportForLeague(league.leagueType);
  const gameCount = await prisma.game.count({ where: { sport, season } });
  if (gameCount === 0) {
    try {
      await syncGamesForLeagueType(league.leagueType, season);
    } catch (e) {
      console.error("Failed to sync games for season", season, e);
    }
  }

  return season;
}

export async function getLeagueContext(leagueId: string, user: SessionUser | null, weekParam?: string) {
  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: {
      commissioner: { select: { username: true } },
      members: {
        include: { user: { select: { id: true, username: true, name: true } } },
      },
    },
  });

  if (!league) notFound();

  const isMember = user
    ? league.members.some((m) => m.userId === user.id)
    : false;
  const isCommissioner = user ? league.commissionerId === user.id : false;

  if (user && !isMember && !league.isPublic) {
    redirect(`/leagues/${leagueId}/join`);
  }

  const season = await ensureLeagueSeason(league);

  const maxWeeks = maxWeeksForLeague(league.leagueType);
  let week: number;
  if (weekParam) {
    week = parseInt(weekParam, 10);
    if (isNaN(week) || week < 1) week = 1;
  } else {
    const seasonGames = await getSeasonGamesForLeague(league.leagueType, season);
    week = getCurrentWeekFromGames(seasonGames);
  }
  if (week > maxWeeks) week = maxWeeks;

  const games = await getLeagueGames(league.leagueType, season, week);
  const deadline = await ensurePickDeadline(leagueId, league.leagueType, season, week);
  const picksOpen = await canMakePicks(leagueId, league.leagueType, season, week);

  return { league, isMember, isCommissioner, week, games, deadline, picksOpen };
}

export function leaguePathWithWeek(leagueId: string, week: number, subpath?: string) {
  const base = subpath ? `/leagues/${leagueId}/${subpath}` : `/leagues/${leagueId}`;
  return `${base}?week=${week}`;
}

export async function getUserPicksForWeek(
  userId: string,
  leagueId: string,
  gameIds: string[]
) {
  if (gameIds.length === 0) return new Map<string, string>();
  const picks = await prisma.pick.findMany({
    where: { userId, leagueId, gameId: { in: gameIds } },
  });
  return new Map(picks.map((p) => [p.gameId, p.pick]));
}

export async function getWeeklyLeaderboardData(leagueId: string, week: number, season: number) {
  const stored = await getStoredWeeklyLeaderboard(leagueId, week, season);
  if (stored) return stored;

  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: {
      members: { include: { user: { select: { id: true, username: true, name: true } } } },
    },
  });
  if (!league) return { rows: [], weekComplete: false, winnerUsernames: [] as string[] };

  const games = await getLeagueGames(league.leagueType, season, week);
  const gameIds = games.map((g) => g.id);

  const picks = await prisma.pick.findMany({
    where: { leagueId, gameId: { in: gameIds } },
    include: { game: true },
  });

  const members = league.members.map((m) => ({
    userId: m.user.id,
    username: m.user.username,
    name: m.user.name,
  }));

  const rows = computeWeeklyScores(members, picks);
  const weekComplete = isWeekCompleteForPickedGames(picks);
  const winnerUsernames = weekComplete
    ? getWeeklyWinners(rows).map((winner) => winner.username)
    : [];

  return { rows, weekComplete, winnerUsernames };
}

export async function getSeasonLeaderboard(leagueId: string, season: number) {
  return getStoredSeasonLeaderboard(leagueId, season);
}

export async function getAllPicksForLeague(leagueId: string, week: number, season: number) {
  const league = await prisma.league.findUnique({ where: { id: leagueId } });
  if (!league) return { games: [], members: [], pickMap: new Map<string, Map<string, string>>() };

  const games = await getLeagueGames(league.leagueType, season, week);
  const members = await prisma.leagueMember.findMany({
    where: { leagueId },
    include: { user: { select: { id: true, username: true } } },
    orderBy: { user: { username: "asc" } },
  });

  const gameIds = games.map((g) => g.id);
  const picks = await prisma.pick.findMany({
    where: { leagueId, gameId: { in: gameIds } },
  });

  const pickMap = new Map<string, Map<string, string>>();
  for (const pick of picks) {
    if (!pickMap.has(pick.userId)) pickMap.set(pick.userId, new Map());
    pickMap.get(pick.userId)!.set(pick.gameId, pick.pick);
  }

  return { games, members, pickMap };
}
