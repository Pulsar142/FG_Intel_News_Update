"use client";

import { useActionState } from "react";
import { createAirbaseAction } from "@/app/actions/admin";
import { REGIONAL_KNOWLEDGE_COUNTRIES } from "@/lib/regionalKnowledge";

export function AirbaseCreateForm() {
  const [state, formAction, pending] = useActionState(createAirbaseAction, undefined);

  const field = "rounded border border-border bg-panel-2 px-3 py-2 text-foreground outline-none focus:border-accent";
  const label = "font-mono text-xs uppercase tracking-widest text-muted";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className={label}>Name</span>
        <input name="name" required className={field} placeholder="e.g. Tengah Air Base" />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={label}>Country</span>
          <input name="country" required list="rk-countries" className={field} />
          <datalist id="rk-countries">
            {REGIONAL_KNOWLEDGE_COUNTRIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Operator</span>
          <input name="operator" className={field} placeholder="e.g. Republic of Singapore Air Force (RSAF)" />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className={label}>Latitude</span>
          <input name="latitude" type="number" step="any" required className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Longitude</span>
          <input name="longitude" type="number" step="any" required className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>ICAO code (optional)</span>
          <input name="icaoCode" className={field} />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className={label}>Base type</span>
        <select name="baseType" defaultValue="MILITARY" className={field}>
          <option value="MILITARY">Military</option>
          <option value="CIVIL_MILITARY_SHARED">Civil/Military Shared</option>
        </select>
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <label className="flex flex-col gap-2">
          <span className={label}>Runway length (ft)</span>
          <input name="runwayLengthFt" type="number" className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Runway width (ft)</span>
          <input name="runwayWidthFt" type="number" className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Elevation (ft)</span>
          <input name="elevationFt" type="number" className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Runways available</span>
          <input name="runwayCount" type="number" className={field} />
        </label>
      </div>
      <p className="-mt-2 font-mono text-[10px] text-muted">
        Leave any of these blank if not publicly confirmed — the site will show &quot;Not publicly
        reported&quot; rather than guessing.
      </p>

      <label className="flex flex-col gap-2">
        <span className={label}>Description</span>
        <textarea name="description" rows={3} required className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className={label}>Sources — one per line, as &quot;Name | https://url&quot;</span>
        <textarea
          name="sources"
          rows={4}
          required
          placeholder={"GlobalSecurity.org | https://...\nWikipedia | https://..."}
          className={field}
        />
      </label>

      {state?.error && <p className="font-mono text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="stencil self-start rounded bg-accent px-5 py-2 text-sm font-semibold tracking-widest text-background hover:bg-accent-strong transition-colors disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create & Add Units"}
      </button>
    </form>
  );
}
