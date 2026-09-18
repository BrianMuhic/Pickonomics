import Link from "next/link";
import { SendRemindersButton } from "@/components/SendRemindersButton";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { REMINDER_HOUR, reminderTimezone } from "@/lib/reminders";

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

      <div className="card">
        <h2 className="section-title mb-2">Pick Reminders</h2>
        <p className="muted mb-4 text-sm">
          NFL leagues are emailed automatically at {REMINDER_HOUR}:00 ({reminderTimezone()}) when
          the week&apos;s deadline is near. Send now to remind everyone with outstanding picks —
          members already reminded today are skipped.
        </p>
        <SendRemindersButton />
      </div>
    </div>
  );
}
