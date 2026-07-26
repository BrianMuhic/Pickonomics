import Link from "next/link";
import { LEAGUE_TYPE_LABELS } from "@/lib/constants";
import type { LeagueTypeValue } from "@/lib/types";

export function LeagueCard({
  id,
  name,
  leagueType,
  isPublic,
  memberCount,
  isMember,
}: {
  id: string;
  name: string;
  leagueType: LeagueTypeValue;
  isPublic: boolean;
  memberCount: number;
  isMember: boolean;
}) {
  return (
    <div className="league-card">
      <div>
        <h3 className="text-lg font-semibold text-[var(--navy)]">{name}</h3>
        <div className="league-card-meta">
          <span className="pill">{LEAGUE_TYPE_LABELS[leagueType]}</span>
          <span className="pill pill-muted">
            {memberCount} member{memberCount !== 1 ? "s" : ""}
          </span>
          <span className="pill pill-muted">{isPublic ? "Public" : "Private"}</span>
        </div>
      </div>
      <div className="league-card-actions">
        {isMember ? (
          <Link href={`/leagues/${id}`} className="btn btn-primary">
            Open League
          </Link>
        ) : (
          <Link href={`/leagues/${id}/join`} className="btn btn-primary">
            Join League
          </Link>
        )}
      </div>
    </div>
  );
}
