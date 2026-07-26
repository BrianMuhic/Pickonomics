import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LEAGUE_TYPE_LABELS } from "@/lib/constants";
import { LEAGUE_TYPES } from "@/lib/types";
import { getUserStats } from "@/lib/user-stats";

export const dynamic = "force-dynamic";

function formatPercentage(value: number | null) {
  if (value === null) return "—";
  return `${value.toFixed(1)}%`;
}

function formatPlace(value: number | null) {
  if (value === null) return "—";
  return value.toFixed(1);
}

export default async function StatsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const stats = await getUserStats(user.id);

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="page-title mb-2">My Stats</h1>
        <p className="muted text-sm">
          @{stats.username} · {stats.name}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <h2 className="muted mb-2 text-xs font-bold uppercase tracking-wider">
            Correct Pick Rate
          </h2>
          <p className="stat-value">{formatPercentage(stats.overall.correctPickPercentage)}</p>
          <p className="muted mt-3 text-sm">Across all leagues with finalized games</p>
        </div>
        <div className="card">
          <h2 className="muted mb-2 text-xs font-bold uppercase tracking-wider">Average Place</h2>
          <p className="stat-value">{formatPlace(stats.overall.averagePlace)}</p>
          <p className="muted mt-3 text-sm">
            Season rank averaged across {stats.overall.leagueCount}{" "}
            {stats.overall.leagueCount === 1 ? "league" : "leagues"}
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title mb-4">By League Type</h2>
        {stats.overall.leagueCount === 0 ? (
          <p className="muted">
            You haven&apos;t joined any leagues yet.{" "}
            <Link href="/" className="text-link">
              Browse leagues
            </Link>{" "}
            to get started.
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>League Type</th>
                <th>Correct Pick Rate</th>
                <th>Leagues Joined</th>
              </tr>
            </thead>
            <tbody>
              {LEAGUE_TYPES.map((type) => {
                const breakdown = stats.byLeagueType[type];
                return (
                  <tr key={type}>
                    <td>{LEAGUE_TYPE_LABELS[type]}</td>
                    <td>{formatPercentage(breakdown.correctPickPercentage)}</td>
                    <td>{breakdown.leaguesJoined}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
