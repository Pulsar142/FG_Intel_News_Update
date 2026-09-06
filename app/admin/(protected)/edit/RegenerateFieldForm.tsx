"use client";

import { useActionState } from "react";
import { regenerateFieldAction } from "@/app/actions/admin";
import type { RegenerableField } from "@/lib/regenerateField";

export function RegenerateFieldForm({
  articleId,
  field,
  label,
}: {
  articleId: string;
  field: RegenerableField;
  label: string;
}) {
  const [state, formAction, pending] = useActionState(regenerateFieldAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded border border-accent/40 bg-panel p-3">
      <input type="hidden" name="articleId" value={articleId} />
      <input type="hidden" name="field" value={field} />
      <span className="font-mono text-xs uppercase tracking-widest text-accent-strong">
        Ask AI to rewrite {label}
      </span>
      <input
        type="text"
        name="question"
        placeholder='e.g. "Did any other country respond?" or "Focus more on the cost angle"'
        className="rounded border border-border bg-panel-2 px-3 py-2 text-foreground outline-none focus:border-accent"
      />
      {state?.error && <p className="font-mono text-xs text-danger">{state.error}</p>}
      {state?.ok && (
        <p className="font-mono text-xs text-accent-strong">
          Regenerated — the {label} field above has been updated.
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="stencil self-start rounded border border-accent px-4 py-2 text-xs font-semibold tracking-widest text-accent-strong hover:bg-accent hover:text-background transition-colors disabled:opacity-60"
      >
        {pending ? "Regenerating…" : "Regenerate"}
      </button>
    </form>
  );
}
