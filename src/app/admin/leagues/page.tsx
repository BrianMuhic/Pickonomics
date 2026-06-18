import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { LEAGUE_TYPE_LABELS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export default async function AdminLeaguesPage() {
  await requireAdmin();

  const leagues = await prisma.league.findMany({
    include: {
      commissioner: { select: { username: true } },
      _count: { select: { members: true, picks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Leagues</h1>
        <Link href="/admin" className="btn">
          Back
        </Link>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Visibility</th>
            <th>Commissioner</th>
            <th>Members</th>
            <th>Picks</th>
            <th>Season</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {leagues.map((league) => (
            <tr key={league.id}>
              <td>{league.name}</td>
              <td>{LEAGUE_TYPE_LABELS[league.leagueType]}</td>
              <td>{league.isPublic ? "Public" : "Private"}</td>
              <td>@{league.commissioner.username}</td>
              <td>{league._count.members}</td>
              <td>{league._count.picks}</td>
              <td>{league.season}</td>
              <td>
                <Link href={`/leagues/${league.id}`} className="text-link text-sm">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
