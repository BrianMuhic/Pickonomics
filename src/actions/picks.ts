"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { currentSeasonYear } from "@/lib/constants";
import { canMakePicks, getLeagueGames } from "@/lib/games";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "./auth";

export async function submitPicksAction(
  leagueId: string,
  week: number,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();

  const membership = await prisma.leagueMember.findUnique({
    where: { leagueId_userId: { leagueId, userId: user.id } },
  });
  if (!membership) return { error: "You are not a member of this league" };

  const league = await prisma.league.findUnique({ where: { id: leagueId } });
  if (!league) return { error: "League not found" };

  const season = currentSeasonYear();
  const canPick = await canMakePicks(leagueId, league.leagueType, season, week);
  if (!canPick) return { error: "Picks are closed for this week" };

  const games = await getLeagueGames(league.leagueType, season, week);
  if (games.length === 0) return { error: "No games available for this week" };

  for (const game of games) {
    const pick = formData.get(`game_${game.id}`);
    if (pick !== "home" && pick !== "away") {
      return { error: "You must pick a winner for every game" };
    }
  }

  for (const game of games) {
    const pick = formData.get(`game_${game.id}`) as string;
    await prisma.pick.upsert({
      where: {
        userId_leagueId_gameId: {
          userId: user.id,
          leagueId,
          gameId: game.id,
        },
      },
      create: {
        userId: user.id,
        leagueId,
        gameId: game.id,
        pick,
      },
      update: { pick },
    });
  }

  revalidatePath(`/leagues/${leagueId}`);
  return { success: "Picks saved!" };
}
