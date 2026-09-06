"use client";

import { useState, useActionState } from "react";
import { regenerateFieldAction, requestFreeFieldRegenerationAction } from "@/app/actions/admin";
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
  const [question, setQuestion] = useState("");
  const [freeState, freeAction, freePending] = useActionState(requestFreeFieldRegenerationAction, undefined);
  const [paidState, paidAction, paidPending] = useActionState(regenerateFieldAction, undefined);

  return (
    <div className="flex flex-col gap-2 rounded border border-accent/40 bg-panel p-3">
      <span className="font-mono text-xs uppercase tracking-widest text-accent-strong">
        Ask AI to rewrite {label}
      </span>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder='e.g. "Did any other country respond?" or "Focus more on the cost angle"'
        className="rounded border border-border bg-panel-2 px-3 py-2 text-foreground outline-none focus:border-accent"
      />
      <div className="flex flex-wrap gap-2">
        <form action={freeAction}>
          <input type="hidden" name="articleId" value={articleId} />
          <input type="hidden" name="field" value={field} />
          <input type="hidden" name="question" value={question} />
          <button
            type="submit"
            disabled={freePending}
            className="stencil rounded border border-accent px-4 py-2 text-xs font-semibold tracking-widest text-accent-strong hover:bg-accent hover:text-background transition-colors disabled:opacity-60"
          >
            {freePending ? "Queuing…" : "Regenerate (Free)"}
          </button>
        </form>
        <form action={paidAction}>
          <input type="hidden" name="articleId" value={articleId} />
          <input type="hidden" name="field" value={field} />
          <input type="hidden" name="question" value={question} />
          <button
            type="submit"
            disabled={paidPending}
            className="stencil rounded border border-gold px-4 py-2 text-xs font-semibold tracking-widest text-gold hover:bg-gold hover:text-background transition-colors disabled:opacity-60"
          >
            {paidPending ? "Regenerating…" : "Regenerate (Instant)"}
          </button>
        </form>
      </div>
      {freeState?.error && <p className="font-mono text-xs text-danger">{freeState.error}</p>}
      {freeState?.ok && (
        <p className="font-mono text-xs text-accent-strong">
          Queued — picked up within about an hour by the free-generation Routine, which will
          rewrite {label} directly. No need to come back and click anything else.
        </p>
      )}
      {paidState?.error && <p className="font-mono text-xs text-danger">{paidState.error}</p>}
      {paidState?.ok && (
        <p className="font-mono text-xs text-accent-strong">
          Regenerated — the {label} field above has been updated.
        </p>
      )}
    </div>
  );
}
