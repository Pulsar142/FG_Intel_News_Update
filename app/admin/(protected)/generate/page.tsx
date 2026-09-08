import { db } from "@/lib/db";
import { GenerateForm } from "@/app/admin/(protected)/generate/GenerateForm";
import { FunFactForm } from "@/app/admin/(protected)/generate/FunFactForm";
import { REGION_LABELS } from "@/lib/sources";
import {
  cancelFreeGenerationRequestAction,
  cancelFunFactRequestAction,
  deleteFunFactAction,
  publishFunFactAction,
  unpublishFunFactAction,
} from "@/app/actions/admin";

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

      {(() => {
        const published = funFacts.find((f) => f.status === "PUBLISHED");
        const drafts = funFacts.filter((f) => f.status === "DRAFT");
        const archived = funFacts.filter((f) => f.status === "ARCHIVED");

        return (
          <>
            <section className="mt-2">
              <h2 className="stencil mb-2 text-sm tracking-widest text-foreground">
                Currently Published
              </h2>
              <p className="mb-2 font-mono text-xs text-muted">
                Only one fun fact is ever shown to viewers — this is it.
              </p>
              {published ? (
                <div className="flex flex-wrap items-start justify-between gap-2 rounded border border-accent bg-panel p-3 font-mono text-xs">
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground">{published.text}</p>
                    <p className="mt-1 text-[10px] text-muted">
                      {published.topic ?? "—"}
                      {published.sourceName ? ` · ${published.sourceName}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <form action={unpublishFunFactAction}>
                      <input type="hidden" name="id" value={published.id} />
                      <button className="rounded border border-border px-2 py-1 text-muted hover:border-gold hover:text-gold transition-colors">
                        Unpublish
                      </button>
                    </form>
                    <form action={deleteFunFactAction}>
                      <input type="hidden" name="id" value={published.id} />
                      <button className="rounded border border-border px-2 py-1 text-muted hover:border-danger hover:text-danger transition-colors">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <p className="rounded border border-border bg-panel p-3 text-center font-mono text-xs text-muted">
                  Nothing published — publish one of the drafts below.
                </p>
              )}
            </section>

            {drafts.length > 0 && (
              <section className="mt-2">
                <h2 className="stencil mb-2 text-sm tracking-widest text-foreground">
                  Draft Fun Facts ({drafts.length})
                </h2>
                <div className="flex flex-col gap-2">
                  {drafts.map((f) => (
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
                      <div className="flex shrink-0 gap-2">
                        <form action={publishFunFactAction}>
                          <input type="hidden" name="id" value={f.id} />
                          <button className="rounded bg-accent px-2 py-1 font-semibold text-background hover:bg-accent-strong transition-colors">
                            Publish
                          </button>
                        </form>
                        <form action={deleteFunFactAction}>
                          <input type="hidden" name="id" value={f.id} />
                          <button className="rounded border border-border px-2 py-1 text-muted hover:border-danger hover:text-danger transition-colors">
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {archived.length > 0 && (
              <details className="mt-2">
                <summary className="stencil cursor-pointer text-sm tracking-widest text-muted">
                  Archived Fun Facts ({archived.length})
                </summary>
                <div className="mt-2 flex flex-col gap-2">
                  {archived.map((f) => (
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
                      <div className="flex shrink-0 gap-2">
                        <form action={publishFunFactAction}>
                          <input type="hidden" name="id" value={f.id} />
                          <button className="rounded border border-gold px-2 py-1 text-gold hover:bg-gold hover:text-background transition-colors">
                            Republish
                          </button>
                        </form>
                        <form action={deleteFunFactAction}>
                          <input type="hidden" name="id" value={f.id} />
                          <button className="rounded border border-border px-2 py-1 text-muted hover:border-danger hover:text-danger transition-colors">
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </>
        );
      })()}
    </div>
  );
}
