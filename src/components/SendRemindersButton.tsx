"use client";

import { useState, useTransition } from "react";
import { sendPickRemindersAction } from "@/actions/reminders";
import type { ActionResult } from "@/actions/auth";
import { Alert } from "@/components/Alert";

export function SendRemindersButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="btn"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            setResult(await sendPickRemindersAction());
          });
        }}
      >
        {pending ? "Sending..." : "Send Pick Reminders"}
      </button>
      {result?.error && <Alert type="error" message={result.error} />}
      {result?.success && <Alert type="success" message={result.success} />}
    </div>
  );
}
