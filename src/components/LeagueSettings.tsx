"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteLeagueAction,
  updateLeagueVisibilityAction,
} from "@/actions/leagues";
import { ChangeLeaguePasswordForm } from "./ChangeLeaguePasswordForm";
import { Alert } from "./Alert";
import { PasswordInput } from "./PasswordInput";

function LeagueVisibilityForm({
  leagueId,
  isPublic: currentIsPublic,
}: {
  leagueId: string;
  isPublic: boolean;
}) {
  const [isPublic, setIsPublic] = useState(currentIsPublic);
  const [state, formAction, pending] = useActionState(updateLeagueVisibilityAction, {});
  const router = useRouter();

  useEffect(() => {
    setIsPublic(currentIsPublic);
  }, [currentIsPublic]);

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  const visibilityChanged = isPublic !== currentIsPublic;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="leagueId" value={leagueId} />
      <input type="hidden" name="isPublic" value={isPublic ? "true" : "false"} />
      <div>
        <h4 className="mb-2 text-sm font-semibold">Visibility</h4>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`league-public-${leagueId}`}
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          <label htmlFor={`league-public-${leagueId}`} className="text-sm">
            Public league (anyone can join)
          </label>
        </div>
        <p className="muted mt-1 text-xs">
          {currentIsPublic
            ? "Currently public. Uncheck to require a password to join."
            : "Currently private. Check to allow anyone to join without a password."}
        </p>
      </div>
      {visibilityChanged && !isPublic && (
        <div>
          <label className="field-label">New league password</label>
          <PasswordInput name="password" required minLength={4} />
        </div>
      )}
      {visibilityChanged && (
        <div>
          <label className="field-label">Your account password</label>
          <PasswordInput name="accountPassword" required />
        </div>
      )}
      {state.error && <Alert type="error" message={state.error} />}
      {state.success && <Alert type="success" message={state.success} />}
      {visibilityChanged && (
        <button type="submit" className="btn btn-primary w-full" disabled={pending}>
          {pending ? "Saving..." : isPublic ? "Make Public" : "Make Private"}
        </button>
      )}
    </form>
  );
}

function DeleteLeagueSection({ leagueId }: { leagueId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleDelete() {
    if (
      !confirm(
        "Delete this league permanently? All members, picks, and deadlines will be removed."
      )
    ) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await deleteLeagueAction(leagueId);
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="border-t border-[var(--border)] pt-4">
      <h4 className="mb-2 text-sm font-semibold text-[var(--red)]">Danger zone</h4>
      {error && <Alert type="error" message={error} />}
      <button
        type="button"
        className="btn btn-danger w-full"
        disabled={pending}
        onClick={handleDelete}
      >
        {pending ? "Deleting..." : "Delete League"}
      </button>
    </div>
  );
}

export function LeagueSettings({
  leagueId,
  isPublic,
}: {
  leagueId: string;
  isPublic: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function openSettings() {
    dialogRef.current?.showModal();
  }

  function closeSettings() {
    dialogRef.current?.close();
  }

  return (
    <div>
      <button type="button" className="btn" onClick={openSettings}>
        League Settings
      </button>
      <dialog
        ref={dialogRef}
        className="league-settings-dialog"
        aria-labelledby="league-settings-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeSettings();
          }
        }}
      >
        <div className="league-settings-dialog-inner">
          <div className="mb-4 flex items-start justify-between gap-3">
            <h3 id="league-settings-title" className="font-semibold">
              League Settings
            </h3>
            <button type="button" className="btn btn-ghost" onClick={closeSettings}>
              Close
            </button>
          </div>
          <div className="space-y-4">
            <LeagueVisibilityForm leagueId={leagueId} isPublic={isPublic} />
            {!isPublic && (
              <div className="border-t border-[var(--border)] pt-4">
                <ChangeLeaguePasswordForm leagueId={leagueId} embedded />
              </div>
            )}
            <DeleteLeagueSection leagueId={leagueId} />
          </div>
        </div>
      </dialog>
    </div>
  );
}
