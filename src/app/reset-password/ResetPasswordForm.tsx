"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPasswordAction } from "@/actions/auth";
import { Alert } from "@/components/Alert";
import { PasswordInput } from "@/components/PasswordInput";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, {});

  if (!token) {
    return (
      <div className="card mx-auto max-w-md">
        <Alert type="error" message="Invalid reset link." />
        <Link href="/forgot-password" className="text-link">
          Request a new link
        </Link>
      </div>
    );
  }

  if (state.success) {
    return (
      <div className="card mx-auto max-w-md">
        <Alert type="success" message={state.success} />
        <Link href="/login" className="btn btn-primary mt-4">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="card mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Set new password</h1>
      {state.error && <Alert type="error" message={state.error} />}
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <label className="field-label">New password</label>
        <PasswordInput name="password" required minLength={6} />
        <button type="submit" className="btn btn-primary w-full" disabled={pending}>
          {pending ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
