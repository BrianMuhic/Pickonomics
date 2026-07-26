import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  await requireAdmin();

  const [userCount, leagueCount, pickCount, gameCount] = await Promise.all([
    prisma.user.count(),
    prisma.league.count(),
    prisma.pick.count(),
    prisma.game.count(),
  ]);

  const stats = [
    { label: "Users", value: userCount },
    { label: "Leagues", value: leagueCount },
    { label: "Picks", value: pickCount },
    { label: "Games", value: gameCount },
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="page-title mb-5">Admin Dashboard</h1>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-tile">
              <p className="muted text-xs font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="stat-value mt-2 text-2xl">{stat.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/admin/leagues" className="btn">
            All Leagues
          </Link>
          <Link href="/admin/users" className="btn">
            All Players
          </Link>
          <Link href="/admin/picks" className="btn">
            All Picks
          </Link>
        </div>
      </div>
    </div>
  );
}
