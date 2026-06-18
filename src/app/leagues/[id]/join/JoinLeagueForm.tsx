"use client";

import { useActionState } from "react";
import { joinLeagueAction } from "@/actions/leagues";
import { Alert } from "@/components/Alert";
import { PasswordInput } from "@/components/PasswordInput";

export function JoinLeagueForm({
  leagueId,
  isPublic,
}: {
  leagueId: string;
  isPublic: boolean;
}) {
  const [state, formAction, pending] = useActionState(joinLeagueAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="leagueId" value={leagueId} />
      {state.error && <Alert type="error" message={state.error} />}
      {!isPublic && (
        <div>
          <label className="field-label">League password</label>
          <PasswordInput name="password" required />
        </div>
      )}
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Joining..." : "Join League"}
      </button>
    </form>
  );
}
