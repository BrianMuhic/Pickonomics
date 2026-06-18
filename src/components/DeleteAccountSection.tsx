"use client";

import { useActionState } from "react";
import { deleteAccountAction } from "@/actions/account";
import { Alert } from "./Alert";
import { PasswordInput } from "./PasswordInput";

export function DeleteAccountSection({
  commissionedLeagueCount,
}: {
  commissionedLeagueCount: number;
}) {
  const [state, formAction, pending] = useActionState(deleteAccountAction, {});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const message =
      commissionedLeagueCount > 0
        ? `Delete your account permanently? This will also delete ${commissionedLeagueCount} league${
            commissionedLeagueCount === 1 ? "" : "s"
          } you commission, along with all picks and memberships. This cannot be undone.`
        : "Delete your account permanently? All your picks and league memberships will be removed. This cannot be undone.";

    if (!confirm(message)) {
      e.preventDefault();
    }
  }

  return (
    <div className="card border-[#7f1d1d]">
      <h2 className="mb-2 text-xl font-semibold text-[var(--red)]">Delete Account</h2>
      <p className="muted mb-4 text-sm">
        Permanently remove your account and all associated data. Enter your password to confirm.
      </p>
      {state.error && <Alert type="error" message={state.error} />}
      <form action={formAction} className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="field-label" htmlFor="delete-password">
            Password
          </label>
          <PasswordInput id="delete-password" name="password" required />
        </div>
        <button type="submit" className="btn btn-danger" disabled={pending}>
          {pending ? "Deleting..." : "Delete My Account"}
        </button>
      </form>
    </div>
  );
}
