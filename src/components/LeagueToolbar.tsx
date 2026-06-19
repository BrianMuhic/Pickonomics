import { ChangeLeaguePasswordForm } from "./ChangeLeaguePasswordForm";
import { FetchScoresButton } from "./FetchScoresButton";
import { LeagueMembershipActions } from "./LeagueMembershipActions";

export function LeagueToolbar({
  leagueId,
  week,
  isCommissioner,
  isPrivate,
}: {
  leagueId: string;
  week: number;
  isCommissioner: boolean;
  isPrivate: boolean;
}) {
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-start justify-end gap-2">
        <FetchScoresButton leagueId={leagueId} week={week} />
        {isCommissioner && isPrivate && <ChangeLeaguePasswordForm leagueId={leagueId} />}
        <LeagueMembershipActions leagueId={leagueId} isCommissioner={isCommissioner} />
      </div>
    </div>
  );
}
