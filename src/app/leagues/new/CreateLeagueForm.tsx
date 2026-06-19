"use client";

import { useActionState, useState } from "react";
import { createLeagueAction } from "@/actions/leagues";
import { Alert } from "@/components/Alert";
import { PasswordInput } from "@/components/PasswordInput";
import { LEAGUE_TYPE_LABELS } from "@/lib/constants";
import { LEAGUE_TYPES } from "@/lib/types";

export function CreateLeagueForm() {
  const [state, formAction, pending] = useActionState(createLeagueAction, {});
  const [isPublic, setIsPublic] = useState(true);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert type="error" message={state.error} />}
      <div>
        <label className="field-label">League name</label>
        <input className="field-input" name="name" required maxLength={100} />
      </div>
      <div>
        <label className="field-label">Sport / Conference</label>
        <select className="field-input" name="leagueType" required defaultValue="NFL">
          {LEAGUE_TYPES.map((value) => (
            <option key={value} value={value}>
              {LEAGUE_TYPE_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isPublic"
          id="isPublic"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        <label htmlFor="isPublic">Public league (anyone can join)</label>
      </div>
      {!isPublic && (
        <div>
          <label className="field-label">League password</label>
          <PasswordInput name="password" required minLength={4} />
        </div>
      )}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Creating..." : "Create League"}
      </button>
    </form>
  );
}
