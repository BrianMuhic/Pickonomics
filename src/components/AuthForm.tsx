"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert } from "./Alert";
import type { ActionResult } from "@/actions/auth";

export function AuthForm({
  title,
  action,
  fields,
  submitLabel,
  footer,
}: {
  title: string;
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  fields: React.ReactNode;
  submitLabel: string;
  footer?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="card mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold">{title}</h1>
      {state.error && <Alert type="error" message={state.error} />}
      {state.success && <Alert type="success" message={state.success} />}
      <form action={formAction} className="space-y-4">
        {fields}
        <button type="submit" className="btn btn-primary w-full" disabled={pending}>
          {pending ? "Please wait..." : submitLabel}
        </button>
      </form>
      {footer}
    </div>
  );
}

export function AuthFooter({ text, linkText, href }: { text: string; linkText: string; href: string }) {
  return (
    <p className="muted mt-4 text-center text-sm">
      {text}{" "}
      <Link href={href} className="text-link">
        {linkText}
      </Link>
    </p>
  );
}
