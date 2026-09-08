import { db } from "@/lib/db";
import { GenerateForm } from "@/app/admin/(protected)/generate/GenerateForm";
import { FunFactForm } from "@/app/admin/(protected)/generate/FunFactForm";
import { REGION_LABELS } from "@/lib/sources";
import { cancelFreeGenerationRequestAction, cancelFunFactRequestAction, deleteFunFactAction } from "@/app/actions/admin";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "text-gold",
  FULFILLED: "text-accent-strong",
  FAILED: "text-danger",
};

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; country?: string }>;
}) {
  const { region, country } = await searchParams;
  const requests = await db.generationRequest.findMany({
    orderBy: { requestedAt: "desc" },
    take: 20,
  });
  const funFactRequests = await db.funFactRequest.findMany({
    orderBy: { requestedAt: "desc" },
    take: 10,
  });
  const funFacts = await db.funFact.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="stencil text-xl text-foreground">Generate</h1>
      <p className="max-w-xl font-mono text-xs text-muted">
        Manually trigger the pipeline for a region, or type any country name under &quot;Custom&quot;
        to draft an ad-hoc briefing for it. New drafts land in Pending Review — nothing goes live
        until you publish it there, even if you&apos;re replacing something already published.
      </p>
      <GenerateForm defaultRegion={region} defaultCountry={country} />

      {requests.length > 0 && (
        <section className="mt-2">
          <h2 className="stencil mb-2 text-sm tracking-widest text-foreground">
            Free Generation Requests
          </h2>
          <div className="flex flex-col gap-2">
            {requests.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-border bg-panel p-3 font-mono text-xs"
              >
                <span>
                  {REGION_LABELS[r.region]}
                  {r.country ? ` · ${r.country}` : ""} —{" "}
                  <span className={STATUS_STYLE[r.status]}>{r.status}</span>
                  {r.note ? ` (${r.note})` : ""}
                </span>
                {r.status === "PENDING" && (
                  <form action={cancelFreeGenerationRequestAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="rounded border border-border px-2 py-1 text-muted hover:border-danger hover:text-danger transition-colors">
                      Cancel
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <hr className="my-2 border-border" />

      <FunFactForm />

      {funFactRequests.length > 0 && (
        <section className="mt-2">
          <h2 className="stencil mb-2 text-sm tracking-widest text-foreground">
            Fun Fact Requests
          </h2>
          <div className="flex flex-col gap-2">
            {funFactRequests.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-border bg-panel p-3 font-mono text-xs"
              >
                <span>
                  {r.topic || "(random topic)"} —{" "}
                  <span className={STATUS_STYLE[r.status]}>{r.status}</span>
                  {r.note ? ` (${r.note})` : ""}
                </span>
                {r.status === "PENDING" && (
                  <form action={cancelFunFactRequestAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="rounded border border-border px-2 py-1 text-muted hover:border-danger hover:text-danger transition-colors">
                      Cancel
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {funFacts.length > 0 && (
        <section className="mt-2">
          <h2 className="stencil mb-2 text-sm tracking-widest text-foreground">
            Military Fun Facts ({funFacts.length})
          </h2>
          <div className="flex flex-col gap-2">
            {funFacts.map((f) => (
              <div
                key={f.id}
                className="flex flex-wrap items-start justify-between gap-2 rounded border border-border bg-panel p-3 font-mono text-xs"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-foreground">{f.text}</p>
                  <p className="mt-1 text-[10px] text-muted">
                    {f.topic ?? "—"}
                    {f.sourceName ? ` · ${f.sourceName}` : ""}
                  </p>
                </div>
                <form action={deleteFunFactAction}>
                  <input type="hidden" name="id" value={f.id} />
                  <button className="rounded border border-border px-2 py-1 text-muted hover:border-danger hover:text-danger transition-colors">
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
