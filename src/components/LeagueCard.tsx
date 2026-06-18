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
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="muted text-sm">
            {LEAGUE_TYPE_LABELS[leagueType]} · {memberCount} member{memberCount !== 1 ? "s" : ""} ·{" "}
            {isPublic ? "Public" : "Private"}
          </p>
        </div>
      </div>
      <div>
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
