import Link from "next/link";
import { db } from "@/lib/db";
import { REGION_LABELS } from "@/lib/sources";
import { storyDateLabel } from "@/lib/weeks";
import { ReliabilityBadge } from "@/app/components/ReliabilityBadge";
import { deleteArticleAction } from "@/app/actions/admin";
import { DeleteButton } from "@/app/components/DeleteButton";
import { HidePerspectiveButton } from "@/app/admin/(protected)/edit/HidePerspectiveButton";

export default async function ArchivedPage() {
  const archived = await db.article.findMany({
    where: { status: "ARCHIVED" },
    orderBy: [{ weekOf: "desc" }, { region: "asc" }],
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="stencil text-xl text-foreground">Archived</h1>
      <p className="font-mono text-xs text-muted">
        Past weeks&apos; briefings — still visible in the public Archive sidebar. Delete permanently
        removes one; there&apos;s no undo.
      </p>

      {archived.length === 0 ? (
        <p className="rounded border border-border bg-panel p-6 text-center text-sm text-muted">
          Nothing archived yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {archived.map((a) => (
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
                  href={`/admin/edit/${a.id}`}
                  className="rounded border border-border px-3 py-1.5 text-foreground hover:border-accent transition-colors"
                >
                  Edit
                </Link>
                <DeleteButton
                  action={deleteArticleAction}
                  articleId={a.id}
                  confirmText="Permanently delete this archived article? This cannot be undone."
                />
                <HidePerspectiveButton articleId={a.id} hidden={a.perspectiveHidden} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
