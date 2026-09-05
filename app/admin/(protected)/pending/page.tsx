import Link from "next/link";
import { db } from "@/lib/db";
import { REGION_LABELS } from "@/lib/sources";
import { weekLabel } from "@/lib/weeks";
import { ReliabilityBadge } from "@/app/components/ReliabilityBadge";
import { publishAction, regenerateAction, discardDraftAction } from "@/app/actions/admin";

export default async function PendingReviewPage() {
  const drafts = await db.article.findMany({
    where: { status: "DRAFT" },
    orderBy: { generatedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="stencil text-xl text-foreground">Pending Review</h1>
      <p className="font-mono text-xs text-muted">
        Bot-generated (or admin-triggered) drafts awaiting verification before they go live.
      </p>

      {drafts.length === 0 ? (
        <p className="rounded border border-border bg-panel p-6 text-center text-sm text-muted">
          Nothing waiting on review. Use the Generate tab to draft a new briefing.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {drafts.map((d) => (
            <div key={d.id} className="rounded border border-border bg-panel p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="stencil text-xs tracking-widest text-gold">
                  {REGION_LABELS[d.region]}
                  {d.country ? ` · ${d.country}` : ""} — {weekLabel(d.weekOf)}
                </p>
                <ReliabilityBadge score={d.reliabilityScore} />
              </div>
              <h2 className="mb-1 text-lg font-semibold text-foreground">{d.title}</h2>
              <p className="mb-3 text-sm text-muted line-clamp-2">{d.summaryP1}</p>
              <div className="flex flex-wrap gap-2 font-mono text-xs">
                <form action={publishAction}>
                  <input type="hidden" name="articleId" value={d.id} />
                  <button className="rounded bg-accent px-3 py-1.5 font-semibold text-background hover:bg-accent-strong transition-colors">
                    Publish
                  </button>
                </form>
                <Link
                  href={`/admin/edit/${d.id}`}
                  className="rounded border border-border px-3 py-1.5 text-foreground hover:border-accent transition-colors"
                >
                  Edit
                </Link>
                <form action={regenerateAction}>
                  <input type="hidden" name="articleId" value={d.id} />
                  <button className="rounded border border-gold px-3 py-1.5 text-gold hover:bg-gold hover:text-background transition-colors">
                    Regenerate
                  </button>
                </form>
                <form action={discardDraftAction}>
                  <input type="hidden" name="articleId" value={d.id} />
                  <button className="rounded border border-border px-3 py-1.5 text-muted hover:border-danger hover:text-danger transition-colors">
                    Discard
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
