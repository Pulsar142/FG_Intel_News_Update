"use client";

import { useActionState, useState } from "react";
import {
  generateAviationSafetyAction,
  requestFreeAviationSafetyAction,
} from "@/app/actions/admin";
import { AVIATION_SAFETY_REGION_LABELS, AVIATION_SAFETY_REGIONS } from "@/lib/aviationSafety";

export function AviationSafetyForm() {
  const [region, setRegion] = useState("ASIA");
  const [country, setCountry] = useState("");

  const [paidState, paidAction, paidPending] = useActionState(generateAviationSafetyAction, undefined);
  const [freeState, freeAction, freePending] = useActionState(requestFreeAviationSafetyAction, undefined);

  const fieldClass =
    "rounded border border-border bg-panel-2 px-3 py-2 text-foreground outline-none focus:border-accent";
  const labelClass = "font-mono text-xs uppercase tracking-widest text-muted";

  return (
    <div className="flex flex-col gap-4 rounded border border-danger/40 bg-panel p-4">
      <div>
        <p className="stencil text-xs tracking-widest text-danger">Request an Aviation Safety Briefing</p>
        <p className="mt-1 text-xs text-muted">
          Baseline: two briefings auto-generate every Monday 09:00 SGT — one Asia-scoped, one
          Global (outside Asia). Use this to request an extra one, including any specific country.
        </p>
      </div>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>Region</span>
        <select value={region} onChange={(e) => setRegion(e.target.value)} className={fieldClass}>
          {AVIATION_SAFETY_REGIONS.map((r) => (
            <option key={r} value={r}>
              {r === "CUSTOM" ? "Custom / Specific Country" : AVIATION_SAFETY_REGION_LABELS[r]}
            </option>
          ))}
        </select>
      </label>

      {region === "CUSTOM" && (
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Country</span>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g. Vietnam, Philippines, Taiwan…"
            className={fieldClass}
          />
        </label>
      )}

      <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
        <form action={freeAction} className="flex flex-col gap-2 rounded border border-accent/40 p-3">
          <input type="hidden" name="region" value={region} />
          <input type="hidden" name="country" value={country} />
          <p className="stencil text-xs tracking-widest text-accent-strong">Free (no API credits)</p>
          <p className="text-xs text-muted">
            Queues a request — fulfilled within about an hour by the free-generation Routine,
            landing in Draft for review.
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
            your Anthropic Console.
          </p>
          {paidState?.error && <p className="font-mono text-xs text-danger">{paidState.error}</p>}
          {paidState?.ok && (
            <p className="font-mono text-xs text-accent-strong">Draft generated — see the list below.</p>
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
