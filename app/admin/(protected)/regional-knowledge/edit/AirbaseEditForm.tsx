"use client";

import { useActionState } from "react";
import { editAirbaseAction } from "@/app/actions/admin";
import { REGIONAL_KNOWLEDGE_COUNTRIES } from "@/lib/regionalKnowledge";

export function AirbaseEditForm({
  id,
  name,
  country,
  operator,
  latitude,
  longitude,
  icaoCode,
  baseType,
  description,
  runwayDesignator,
  runwayLengthFt,
  runwayWidthFt,
  elevationFt,
  runwayCount,
  sources,
}: {
  id: string;
  name: string;
  country: string;
  operator: string;
  latitude: number;
  longitude: number;
  icaoCode: string;
  baseType: string;
  description: string;
  runwayDesignator: string | null;
  runwayLengthFt: number | null;
  runwayWidthFt: number | null;
  elevationFt: number | null;
  runwayCount: number | null;
  sources: string;
}) {
  const [state, formAction, pending] = useActionState(editAirbaseAction, undefined);

  const field = "rounded border border-border bg-panel-2 px-3 py-2 text-foreground outline-none focus:border-accent";
  const label = "font-mono text-xs uppercase tracking-widest text-muted";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={id} />

      <label className="flex flex-col gap-2">
        <span className={label}>Name</span>
        <input name="name" defaultValue={name} required className={field} />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={label}>Country</span>
          <input name="country" defaultValue={country} required list="rk-countries-edit" className={field} />
          <datalist id="rk-countries-edit">
            {REGIONAL_KNOWLEDGE_COUNTRIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Operator</span>
          <input name="operator" defaultValue={operator} className={field} />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className={label}>Latitude</span>
          <input name="latitude" type="number" step="any" defaultValue={latitude} required className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Longitude</span>
          <input name="longitude" type="number" step="any" defaultValue={longitude} required className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>ICAO code (optional)</span>
          <input name="icaoCode" defaultValue={icaoCode} className={field} />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className={label}>Base type</span>
        <select name="baseType" defaultValue={baseType} className={field}>
          <option value="MILITARY">Military</option>
          <option value="CIVIL_MILITARY_SHARED">Civil/Military Shared</option>
        </select>
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        <label className="flex flex-col gap-2">
          <span className={label}>Runway designator</span>
          <input name="runwayDesignator" defaultValue={runwayDesignator ?? ""} placeholder="e.g. 18/36" className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Runway length (ft)</span>
          <input name="runwayLengthFt" type="number" defaultValue={runwayLengthFt ?? ""} className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Runway width (ft)</span>
          <input name="runwayWidthFt" type="number" defaultValue={runwayWidthFt ?? ""} className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Elevation (ft)</span>
          <input name="elevationFt" type="number" defaultValue={elevationFt ?? ""} className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Runways available</span>
          <input name="runwayCount" type="number" defaultValue={runwayCount ?? ""} className={field} />
        </label>
      </div>
      <p className="-mt-2 font-mono text-[10px] text-muted">
        Leave any of these blank if not publicly confirmed — the site will show &quot;Not publicly
        reported&quot; rather than guessing.
      </p>

      <label className="flex flex-col gap-2">
        <span className={label}>Description</span>
        <textarea name="description" defaultValue={description} rows={3} required className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className={label}>Sources — one per line, as &quot;Name | https://url&quot;</span>
        <textarea name="sources" defaultValue={sources} rows={4} required className={field} />
      </label>

      {state?.error && <p className="font-mono text-sm text-danger">{state.error}</p>}
      {state?.ok && <p className="font-mono text-sm text-accent-strong">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="stencil self-start rounded bg-accent px-5 py-2 text-sm font-semibold tracking-widest text-background hover:bg-accent-strong transition-colors disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
