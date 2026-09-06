"use client";

import { useActionState } from "react";
import { regenerateAction, requestFreeGenerationAction } from "@/app/actions/admin";
import type { Region } from "@/generated/prisma/client";

export function RegenerateButtons({
  articleId,
  region,
  country,
}: {
  articleId: string;
  region: Region;
  country: string | null;
}) {
  const [paidState, paidAction, paidPending] = useActionState(regenerateAction, undefined);
  const [freeState, freeAction, freePending] = useActionState(requestFreeGenerationAction, undefined);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-2">
        <form action={freeAction}>
          <input type="hidden" name="region" value={region} />
          {country && <input type="hidden" name="country" value={country} />}
          <button
            disabled={freePending}
            className="rounded border border-accent px-3 py-1.5 text-accent-strong hover:bg-accent hover:text-background transition-colors disabled:opacity-60"
          >
            {freePending ? "Queuing…" : "Regenerate (Free)"}
          </button>
        </form>
        <form action={paidAction}>
          <input type="hidden" name="articleId" value={articleId} />
          <button
            disabled={paidPending}
            className="rounded border border-gold px-3 py-1.5 text-gold hover:bg-gold hover:text-background transition-colors disabled:opacity-60"
          >
            {paidPending ? "Regenerating…" : "Regenerate (Instant)"}
          </button>
        </form>
      </div>
      {freeState?.error && <p className="font-mono text-xs text-danger">{freeState.error}</p>}
      {freeState?.ok && (
        <p className="font-mono text-xs text-accent-strong">
          Queued — a new draft will appear here within about an hour. This draft is left in place;
          Discard it once the replacement lands, or keep both to compare.
        </p>
      )}
      {paidState?.error && <p className="font-mono text-xs text-danger">{paidState.error}</p>}
    </div>
  );
}
