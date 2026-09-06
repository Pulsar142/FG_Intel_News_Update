import Link from "next/link";
import { db } from "@/lib/db";
import { REGION_LABELS } from "@/lib/sources";
import { storyDateLabel } from "@/lib/weeks";
import { ReliabilityBadge } from "@/app/components/ReliabilityBadge";
import { archiveAction, deleteArticleAction } from "@/app/actions/admin";
import { DeleteButton } from "@/app/components/DeleteButton";

export default async function PublishedPage() {
  const published = await db.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ weekOf: "desc" }, { region: "asc" }],
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="stencil text-xl text-foreground">Published</h1>
      <p className="font-mono text-xs text-muted">
        Live on the public site. Generate a fresh draft for the same region from the Generate tab,
        then Publish it here to swap out an already-published briefing.
      </p>

      {published.length === 0 ? (
        <p className="rounded border border-border bg-panel p-6 text-center text-sm text-muted">
          Nothing published yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {published.map((a) => (
            <div key={a.id} className="rounded border border-border bg-panel p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="stencil text-xs tracking-widest text-gold">
                  {REGION_LABELS[a.region]}
                  {a.country ? ` · ${a.country}` : ""} — {storyDateLabel(a.articleDate, a.publishedAt, a.weekOf)}
                </p>
                <ReliabilityBadge score={a.reliabilityScore} />
              </div>
              <h2 className="mb-3 text-lg font-semibold text-foreground">{a.title}</h2>
              <div className="flex flex-wrap gap-2 font-mono text-xs">
                <Link
                  href={`/article/${a.slug}`}
                  target="_blank"
                  className="rounded border border-accent px-3 py-1.5 text-accent-strong hover:bg-accent hover:text-background transition-colors"
                >
                  View live
                </Link>
                <Link
                  href={`/admin/generate?region=${a.region}${a.country ? `&country=${encodeURIComponent(a.country)}` : ""}`}
                  className="rounded border border-gold px-3 py-1.5 text-gold hover:bg-gold hover:text-background transition-colors"
                >
                  Generate replacement
                </Link>
                <Link
                  href={`/admin/edit/${a.id}`}
                  className="rounded border border-border px-3 py-1.5 text-foreground hover:border-accent transition-colors"
                >
                  Edit
                </Link>
                <form action={archiveAction}>
                  <input type="hidden" name="articleId" value={a.id} />
                  <button className="rounded border border-border px-3 py-1.5 text-muted hover:border-danger hover:text-danger transition-colors">
                    Archive
                  </button>
                </form>
                <DeleteButton
                  action={deleteArticleAction}
                  articleId={a.id}
                  confirmText="Permanently delete this published article? It will disappear from the live site immediately. This cannot be undone."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
