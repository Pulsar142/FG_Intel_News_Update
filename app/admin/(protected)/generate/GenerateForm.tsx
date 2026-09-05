"use client";

import { useActionState } from "react";
import { generateAction } from "@/app/actions/admin";
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
  const [state, formAction, pending] = useActionState(generateAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded border border-border bg-panel p-4">
      <label className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">Region</span>
        <select
          name="region"
          defaultValue={defaultRegion ?? "SINGAPORE"}
          className="rounded border border-border bg-panel-2 px-3 py-2 text-foreground outline-none focus:border-accent"
        >
          {ALL_REGIONS.map((r) => (
            <option key={r} value={r}>
              {r === "CUSTOM" ? "Custom / Other Country" : REGION_LABELS[r]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          Country (optional filter, required for Custom)
        </span>
        <input
          type="text"
          name="country"
          defaultValue={defaultCountry ?? ""}
          placeholder="e.g. Vietnam, Philippines, Taiwan…"
          className="rounded border border-border bg-panel-2 px-3 py-2 text-foreground outline-none focus:border-accent"
        />
      </label>

      {state?.error && <p className="font-mono text-sm text-danger">{state.error}</p>}
      {state?.ok && (
        <p className="font-mono text-sm text-accent-strong">
          Draft generated — check the Pending Review tab.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="stencil self-start rounded bg-accent px-5 py-2 text-sm font-semibold tracking-widest text-background hover:bg-accent-strong transition-colors disabled:opacity-60"
      >
        {pending ? "Generating…" : "Generate Draft"}
      </button>
    </form>
  );
}
