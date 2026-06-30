import { getLeagueGames } from "@/lib/games";
import { prisma } from "@/lib/prisma";
import {
  computeWeeklyScores,
  getWeeklyWinners,
  isWeekCompleteForPickedGames,
} from "@/lib/scoring";

export async function finalizeWeeklyResults(
  leagueId: string,
  week: number,
  season: number
): Promise<boolean> {
  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: {
      members: { include: { user: { select: { id: true, username: true, name: true } } } },
    },
  });
  if (!league) return false;

  const games = await getLeagueGames(league.leagueType, season, week);
  const gameIds = games.map((g) => g.id);
  if (gameIds.length === 0) return false;

  const picks = await prisma.pick.findMany({
    where: { leagueId, gameId: { in: gameIds } },
    include: { game: true },
  });
  if (!isWeekCompleteForPickedGames(picks)) return false;

  const members = league.members.map((m) => ({
    userId: m.user.id,
    username: m.user.username,
    name: m.user.name,
  }));
  const scores = computeWeeklyScores(members, picks);
  const winners = new Set(getWeeklyWinners(scores).map((winner) => winner.userId));

  await prisma.$transaction(
    scores.map((score) =>
      prisma.weeklyResult.upsert({
        where: {
          leagueId_userId_week_season: {
            leagueId,
            userId: score.userId,
            week,
            season,
          },
        },
        create: {
          leagueId,
          userId: score.userId,
          week,
          season,
          correct: score.correct,
          totalPicks: score.totalPicks,
          wonWeek: winners.has(score.userId),
        },
        update: {
          correct: score.correct,
          totalPicks: score.totalPicks,
          wonWeek: winners.has(score.userId),
          finalizedAt: new Date(),
        },
      })
    )
  );

  return true;
}

export async function getStoredWeeklyLeaderboard(
  leagueId: string,
  week: number,
  season: number
) {
  const stored = await prisma.weeklyResult.findMany({
    where: { leagueId, week, season },
    include: { user: { select: { username: true, name: true } } },
  });
  if (stored.length === 0) return null;

  const rows = stored
    .map((result) => ({
      username: result.user.username,
      name: result.user.name,
      correct: result.correct,
      totalPicks: result.totalPicks,
    }))
    .sort((a, b) => b.correct - a.correct || a.username.localeCompare(b.username));

  return {
    rows,
    weekComplete: true,
    winnerUsernames: stored.filter((result) => result.wonWeek).map((result) => result.user.username),
  };
}

export async function getStoredSeasonLeaderboard(leagueId: string, season: number) {
  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: {
      members: { include: { user: { select: { id: true, username: true, name: true } } } },
    },
  });
  if (!league) return [];

  const results = await prisma.weeklyResult.findMany({
    where: { leagueId, season },
  });

  const standings = new Map(
    league.members.map((m) => [
      m.user.id,
      {
        userId: m.user.id,
        username: m.user.username,
        name: m.user.name,
        weeklyWins: 0,
        totalCorrect: 0,
      },
    ])
  );

  for (const result of results) {
    const entry = standings.get(result.userId);
    if (!entry) continue;
    if (result.wonWeek) entry.weeklyWins++;
    entry.totalCorrect += result.correct;
  }

  return Array.from(standings.values()).sort(
    (a, b) =>
      b.weeklyWins - a.weeklyWins ||
      b.totalCorrect - a.totalCorrect ||
      a.username.localeCompare(b.username)
  );
}
