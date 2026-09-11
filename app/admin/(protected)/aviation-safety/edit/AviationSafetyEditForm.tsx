"use client";

import { useActionState } from "react";
import { editAviationSafetyAction } from "@/app/actions/admin";

export function AviationSafetyEditForm({
  id,
  title,
  incidentCategory,
  sector,
  incidentDate,
  aircraftInfo,
  summaryP1,
  summaryP2,
  summaryP3,
  safetyAnalysis,
  preventativeMeasures,
  hfacsAnalysis,
  bullets,
  sources,
}: {
  id: string;
  title: string;
  incidentCategory: string;
  sector: string;
  incidentDate: string;
  aircraftInfo: string;
  summaryP1: string;
  summaryP2: string;
  summaryP3: string;
  safetyAnalysis: string;
  preventativeMeasures: string;
  hfacsAnalysis: string;
  bullets: string;
  sources: string;
}) {
  const [state, formAction, pending] = useActionState(editAviationSafetyAction, undefined);

  const field = "rounded border border-border bg-panel-2 px-3 py-2 text-foreground outline-none focus:border-accent";
  const label = "font-mono text-xs uppercase tracking-widest text-muted";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={id} />

      <label className="flex flex-col gap-2">
        <span className={label}>Title</span>
        <input name="title" defaultValue={title} className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className={label}>Incident category</span>
        <input name="incidentCategory" defaultValue={incidentCategory} className={field} />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={label}>Incident date (the event&apos;s own date)</span>
          <input type="date" name="incidentDate" defaultValue={incidentDate} className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Aircraft / operator (optional)</span>
          <input name="aircraftInfo" defaultValue={aircraftInfo} className={field} />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className={label}>Sector (drives the Military/Commercial trend chart)</span>
        <select name="sector" defaultValue={sector} className={field}>
          <option value="MILITARY">Military</option>
          <option value="COMMERCIAL">Commercial</option>
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className={label}>Summary — paragraph 1</span>
        <textarea name="summaryP1" defaultValue={summaryP1} rows={4} className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className={label}>Summary — paragraph 2</span>
        <textarea name="summaryP2" defaultValue={summaryP2} rows={4} className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className={label}>Summary — paragraph 3</span>
        <textarea name="summaryP3" defaultValue={summaryP3} rows={4} className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className={label}>Safety Analysis (5-Why + fishbone)</span>
        <textarea name="safetyAnalysis" defaultValue={safetyAnalysis} rows={10} className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className={label}>Preventative Measures</span>
        <textarea name="preventativeMeasures" defaultValue={preventativeMeasures} rows={5} className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className={label}>HFACS categorisation (leave blank if human error isn&apos;t a genuine factor)</span>
        <textarea name="hfacsAnalysis" defaultValue={hfacsAnalysis} rows={5} className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className={label}>Quick Brief bullets (one per line, 5 — summary + Safety Analysis)</span>
        <textarea name="bullets" defaultValue={bullets} rows={6} className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className={label}>Sources &amp; links — one per line, as &quot;Name | https://url&quot;</span>
        <textarea
          name="sources"
          defaultValue={sources}
          rows={5}
          placeholder={"NTSB Preliminary Report | https://ntsb.gov/...\nThe Aviation Herald | https://avherald.com/..."}
          className={field}
        />
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
