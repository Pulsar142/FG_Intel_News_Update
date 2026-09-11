"use client";

import { useActionState } from "react";
import { addAirbaseUnitAction, deleteAirbaseUnitAction } from "@/app/actions/admin";
import { AIRBASE_UNIT_CATEGORIES, AIRBASE_UNIT_CATEGORY_LABELS } from "@/lib/regionalKnowledge";
import type { AirbaseUnitCategory } from "@/generated/prisma/client";
import type { ArticleSource } from "@/lib/types";

type Unit = {
  id: string;
  category: AirbaseUnitCategory;
  unitName: string;
  aircraftType: string | null;
  approxCount: number | null;
  notes: string | null;
  sources: string;
};

export function AirbaseUnitsPanel({ airbaseId, units }: { airbaseId: string; units: Unit[] }) {
  const [state, formAction, pending] = useActionState(addAirbaseUnitAction, undefined);

  const field = "rounded border border-border bg-panel-2 px-3 py-2 text-foreground outline-none focus:border-accent";
  const label = "font-mono text-xs uppercase tracking-widest text-muted";

  return (
    <div className="flex flex-col gap-4">
      <h2 className="stencil text-sm tracking-widest text-foreground">Resident Units ({units.length})</h2>

      <div className="flex flex-col gap-2">
        {units.map((u) => {
          const src = JSON.parse(u.sources) as ArticleSource[];
          return (
            <div key={u.id} className="flex flex-col gap-1 rounded border border-border bg-panel p-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-danger">
                  {AIRBASE_UNIT_CATEGORY_LABELS[u.category]}
                </p>
                <p className="text-sm font-semibold text-foreground">{u.unitName}</p>
                {u.aircraftType && <p className="text-sm text-muted">{u.aircraftType}{u.approxCount ? ` · ~${u.approxCount}` : ""}</p>}
                {u.notes && <p className="text-xs text-muted">{u.notes}</p>}
                <p className="mt-1 font-mono text-[10px] text-muted">
                  {src.map((s) => s.name).join(", ")}
                </p>
              </div>
              <form action={deleteAirbaseUnitAction}>
                <input type="hidden" name="id" value={u.id} />
                <input type="hidden" name="airbaseId" value={airbaseId} />
                <button className="rounded border border-danger/60 px-3 py-1 font-mono text-xs text-danger hover:bg-danger hover:text-background transition-colors">
                  Delete
                </button>
              </form>
            </div>
          );
        })}
        {units.length === 0 && <p className="font-mono text-xs text-muted">No units added yet.</p>}
      </div>

      <form action={formAction} className="flex flex-col gap-3 rounded border border-border bg-panel p-4">
        <input type="hidden" name="airbaseId" value={airbaseId} />
        <p className={label}>Add a unit</p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className={label}>Category</span>
            <select name="category" required className={field}>
              {AIRBASE_UNIT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {AIRBASE_UNIT_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className={label}>Unit name</span>
            <input name="unitName" required className={field} placeholder='e.g. 142 Squadron "Gryphon"' />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className={label}>Aircraft type (optional)</span>
            <input name="aircraftType" className={field} placeholder="e.g. F-15SG Strike Eagle" />
          </label>
          <label className="flex flex-col gap-1">
            <span className={label}>Approx. count (optional)</span>
            <input name="approxCount" type="number" className={field} />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className={label}>Notes (optional)</span>
          <textarea name="notes" rows={2} className={field} />
        </label>

        <label className="flex flex-col gap-1">
          <span className={label}>Sources — one per line, as &quot;Name | https://url&quot;</span>
          <textarea name="sources" rows={2} required className={field} />
        </label>

        {state?.error && <p className="font-mono text-sm text-danger">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="stencil self-start rounded bg-accent px-4 py-1.5 text-xs font-semibold tracking-widest text-background hover:bg-accent-strong transition-colors disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add Unit"}
        </button>
      </form>
    </div>
  );
}
