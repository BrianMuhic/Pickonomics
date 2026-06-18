import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { LEAGUE_TYPE_LABELS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export default async function AdminPicksPage({
  searchParams,
}: {
  searchParams: Promise<{ leagueId?: string }>;
}) {
  await requireAdmin();
  const { leagueId } = await searchParams;

  const leagues = await prisma.league.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, leagueType: true },
  });

  const picks = await prisma.pick.findMany({
    where: leagueId ? { leagueId } : undefined,
    include: {
      user: { select: { username: true } },
      league: { select: { name: true, leagueType: true } },
      game: {
        include: {
          awayTeam: { select: { abbreviation: true } },
          homeTeam: { select: { abbreviation: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return (
    <div className="card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">All Picks</h1>
        <Link href="/admin" className="btn">
          Back
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/admin/picks"
          className={`btn ${!leagueId ? "btn-primary" : ""}`}
        >
          All leagues
        </Link>
        {leagues.map((l) => (
          <Link
            key={l.id}
            href={`/admin/picks?leagueId=${l.id}`}
            className={`btn ${leagueId === l.id ? "btn-primary" : ""}`}
          >
            {l.name}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>League</th>
              <th>Week</th>
              <th>Game</th>
              <th>Pick</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {picks.length === 0 ? (
              <tr>
                <td colSpan={6} className="muted">
                  No picks found.
                </td>
              </tr>
            ) : (
              picks.map((pick) => {
                const pickedTeam =
                  pick.pick === "away"
                    ? pick.game.awayTeam.abbreviation
                    : pick.game.homeTeam.abbreviation;
                const correct = pick.game.winner && pick.pick === pick.game.winner;
                const wrong = pick.game.winner && pick.pick !== pick.game.winner;
                return (
                  <tr key={pick.id}>
                    <td>@{pick.user.username}</td>
                    <td>{pick.league.name}</td>
                    <td>{pick.game.week}</td>
                    <td>
                      {pick.game.awayTeam.abbreviation} @ {pick.game.homeTeam.abbreviation}
                    </td>
                    <td>{pickedTeam}</td>
                    <td>
                      {!pick.game.winner ? "⏳" : correct ? "✅" : wrong ? "❌" : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
