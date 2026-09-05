"use client";

import { useActionState } from "react";
import type { AuthFormState } from "@/app/actions/auth";

export function LoginForm({
  action,
  next,
  submitLabel,
}: {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  next?: string;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-widest text-muted font-mono">Password</span>
        <input
          type="password"
          name="password"
          required
          autoFocus
          className="rounded border border-border bg-panel-2 px-3 py-2 text-foreground outline-none focus:border-accent"
        />
      </label>
      {state?.error && (
        <p className="text-sm text-danger font-mono">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="stencil rounded bg-accent px-4 py-2 text-background font-semibold tracking-widest hover:bg-accent-strong transition-colors disabled:opacity-60"
      >
        {pending ? "Verifying…" : submitLabel}
      </button>
    </form>
  );
}
