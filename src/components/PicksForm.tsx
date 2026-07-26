"use client";

import { useActionState } from "react";
import { submitPicksAction } from "@/actions/picks";
import { Alert } from "./Alert";
import { formatGameDateTime } from "@/lib/datetime";

type GameRow = {
  id: string;
  away: string;
  home: string;
  kickoff: string;
  status: string;
  awayScore: number | null;
  homeScore: number | null;
  winner: string | null;
  userPick: string | null;
};

export function PicksForm({
  leagueId,
  week,
  games,
  canPick,
  deadline,
}: {
  leagueId: string;
  week: number;
  games: GameRow[];
  canPick: boolean;
  deadline: string | null;
}) {
  const boundAction = submitPicksAction.bind(null, leagueId, week);
  const [state, formAction, pending] = useActionState(boundAction, {});

  if (games.length === 0) {
    return (
      <p className="muted">
        No games for this week yet. Try the Fetch Scores button to load the latest schedule.
      </p>
    );
  }

  return (
    <div>
      {!canPick && (
        <Alert
          type="warning"
          message={`Picks are closed for Week ${week}.${deadline ? ` Deadline was ${deadline}.` : ""}`}
        />
      )}
      {deadline && canPick && (
        <Alert type="success" message={`Picks close: ${deadline}`} />
      )}
      {state.error && <Alert type="error" message={state.error} />}
      {state.success && <Alert type="success" message={state.success} />}

      <form action={formAction} className={!canPick ? "pointer-events-none opacity-50" : ""}>
        <div className="space-y-3">
          {games.map((game) => (
            <div key={game.id} className="game-row">
              <div className="muted mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>{formatGameDateTime(game.kickoff)}</span>
                {game.winner && (
                  <span className="font-semibold text-[var(--navy)]">
                    Final {game.awayScore}–{game.homeScore}
                  </span>
                )}
              </div>
              <div className="pick-grid">
                <label className="pick-option">
                  <input
                    type="radio"
                    name={`game_${game.id}`}
                    value="away"
                    defaultChecked={game.userPick === "away"}
                    required
                    disabled={!canPick}
                  />
                  <span>{game.away}</span>
                </label>
                <div className="pick-vs" aria-hidden="true">
                  VS
                </div>
                <label className="pick-option">
                  <input
                    type="radio"
                    name={`game_${game.id}`}
                    value="home"
                    defaultChecked={game.userPick === "home"}
                    required
                    disabled={!canPick}
                  />
                  <span>{game.home}</span>
                </label>
              </div>
            </div>
          ))}
        </div>
        {canPick && (
          <button type="submit" className="btn btn-primary mt-5 w-full sm:w-auto" disabled={pending}>
            {pending ? "Saving..." : "Save Picks"}
          </button>
        )}
      </form>
    </div>
  );
}
