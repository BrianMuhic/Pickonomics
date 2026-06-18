import Link from "next/link";
import { maxWeeksForLeague } from "@/lib/constants";
import type { LeagueTypeValue } from "@/lib/types";

export function WeekSelector({
  leagueId,
  currentWeek,
  leagueType,
  basePath = "",
}: {
  leagueId: string;
  currentWeek: number;
  leagueType: LeagueTypeValue;
  basePath?: string;
}) {
  const maxWeeks = maxWeeksForLeague(leagueType);
  const weeks = Array.from({ length: maxWeeks }, (_, i) => i + 1);
  const path = basePath ? `/leagues/${leagueId}/${basePath}` : `/leagues/${leagueId}`;

  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="muted mr-2 text-sm">Week:</span>
      {weeks.map((week) => (
        <Link
          key={week}
          href={`${path}?week=${week}`}
          className={`week-btn ${week === currentWeek ? "week-btn-active" : ""}`}
        >
          {week}
        </Link>
      ))}
    </div>
  );
}
