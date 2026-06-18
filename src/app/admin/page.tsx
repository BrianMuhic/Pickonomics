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

  return (
    <div className="space-y-4">
      <div className="card">
        <h1 className="mb-4 text-2xl font-bold">Admin Dashboard</h1>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-[#0b1220] p-4">
            <p className="muted text-sm">Users</p>
            <p className="text-2xl font-bold">{userCount}</p>
          </div>
          <div className="rounded-lg bg-[#0b1220] p-4">
            <p className="muted text-sm">Leagues</p>
            <p className="text-2xl font-bold">{leagueCount}</p>
          </div>
          <div className="rounded-lg bg-[#0b1220] p-4">
            <p className="muted text-sm">Picks</p>
            <p className="text-2xl font-bold">{pickCount}</p>
          </div>
          <div className="rounded-lg bg-[#0b1220] p-4">
            <p className="muted text-sm">Games</p>
            <p className="text-2xl font-bold">{gameCount}</p>
          </div>
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
