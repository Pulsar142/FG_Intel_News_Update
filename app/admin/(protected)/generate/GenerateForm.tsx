"use client";

import { useActionState, useState } from "react";
import { generateAction, requestFreeGenerationAction } from "@/app/actions/admin";
import { REGION_LABELS } from "@/lib/sources";
import type { Region } from "@/generated/prisma/client";

const ALL_REGIONS: Region[] = ["SINGAPORE", "SEA", "GLOBAL", "USA", "MALAYSIA", "INDONESIA", "CUSTOM"];

export function GenerateForm({
  defaultRegion,
  defaultCountry,
}: {
  defaultRegion?: string;
  defaultCountry?: string;
}) {
  const [region, setRegion] = useState(defaultRegion ?? "SINGAPORE");
  const [country, setCountry] = useState(defaultCountry ?? "");

  const [paidState, paidAction, paidPending] = useActionState(generateAction, undefined);
  const [freeState, freeAction, freePending] = useActionState(requestFreeGenerationAction, undefined);

  const fieldClass =
    "rounded border border-border bg-panel-2 px-3 py-2 text-foreground outline-none focus:border-accent";
  const labelClass = "font-mono text-xs uppercase tracking-widest text-muted";

  return (
    <div className="flex flex-col gap-4 rounded border border-border bg-panel p-4">
      <label className="flex flex-col gap-2">
        <span className={labelClass}>Region</span>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className={fieldClass}
        >
          {ALL_REGIONS.map((r) => (
            <option key={r} value={r}>
              {r === "CUSTOM" ? "Custom / Other Country" : REGION_LABELS[r]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>Country (optional filter, required for Custom)</span>
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="e.g. Vietnam, Philippines, Taiwan…"
          className={fieldClass}
        />
      </label>

      <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
        <form action={freeAction} className="flex flex-col gap-2 rounded border border-accent/40 p-3">
          <input type="hidden" name="region" value={region} />
          <input type="hidden" name="country" value={country} />
          <p className="stencil text-xs tracking-widest text-accent-strong">Free (no API credits)</p>
          <p className="text-xs text-muted">
            Queues a request — fulfilled within about an hour by a Claude Code session that
            researches and writes it on its own, then drops the draft into Pending Review.
          </p>
          {freeState?.error && <p className="font-mono text-xs text-danger">{freeState.error}</p>}
          {freeState?.ok && (
            <p className="font-mono text-xs text-accent-strong">Queued — see the list below.</p>
          )}
          <button
            type="submit"
            disabled={freePending}
            className="stencil mt-1 self-start rounded border border-accent px-4 py-2 text-xs font-semibold tracking-widest text-accent-strong hover:bg-accent hover:text-background transition-colors disabled:opacity-60"
          >
            {freePending ? "Queuing…" : "Request Free Generation"}
          </button>
        </form>

        <form action={paidAction} className="flex flex-col gap-2 rounded border border-border p-3">
          <input type="hidden" name="region" value={region} />
          <input type="hidden" name="country" value={country} />
          <p className="stencil text-xs tracking-widest text-gold">Instant (uses API credits)</p>
          <p className="text-xs text-muted">
            Calls the Claude API right now via <code>ANTHROPIC_API_KEY</code>. Needs credits in
            your Anthropic Console — otherwise this will show a billing error.
          </p>
          {paidState?.error && <p className="font-mono text-xs text-danger">{paidState.error}</p>}
          {paidState?.ok && (
            <p className="font-mono text-xs text-accent-strong">
              Draft generated — check Pending Review.
            </p>
          )}
          <button
            type="submit"
            disabled={paidPending}
            className="stencil mt-1 self-start rounded bg-accent px-4 py-2 text-xs font-semibold tracking-widest text-background hover:bg-accent-strong transition-colors disabled:opacity-60"
          >
            {paidPending ? "Generating…" : "Generate Now"}
          </button>
        </form>
      </div>
    </div>
  );
}
