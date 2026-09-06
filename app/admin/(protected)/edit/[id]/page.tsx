import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { REGION_LABELS } from "@/lib/sources";
import { EditForm } from "@/app/admin/(protected)/edit/EditForm";
import { ImageForm } from "@/app/admin/(protected)/edit/ImageForm";
import { RegenerateFieldForm } from "@/app/admin/(protected)/edit/RegenerateFieldForm";
import type { ArticleImage, ArticleSource } from "@/lib/types";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await db.article.findUnique({ where: { id } });
  if (!article) notFound();

  const images = JSON.parse(article.images) as ArticleImage[];
  const sources = JSON.parse(article.sources) as ArticleSource[];
  const fieldRequests = await db.fieldRegenerationRequest.findMany({
    where: { articleId: article.id },
    orderBy: { requestedAt: "desc" },
    take: 10,
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="stencil text-xl text-foreground">Edit Article</h1>
      <p className="font-mono text-xs text-gold">
        {REGION_LABELS[article.region]}
        {article.country ? ` · ${article.country}` : ""} — {article.status}
      </p>
      <ImageForm articleId={article.id} image={images[0] ?? null} sources={sources} />
      <EditForm
        key={`${article.didYouKnow}|${article.perspective}`}
        articleId={article.id}
        title={article.title}
        summaryP1={article.summaryP1}
        summaryP2={article.summaryP2}
        didYouKnow={article.didYouKnow}
        perspective={article.perspective}
        bullets={JSON.parse(article.bullets)}
      />
      <div className="flex flex-col gap-3 rounded border border-border bg-panel p-4">
        <p className="stencil text-xs tracking-widest text-foreground">AI-Assisted Rewrite</p>
        <p className="font-mono text-xs text-muted">
          Ask a question or give an instruction and have just that section rewritten — the fields
          above update immediately. You can still hand-edit either section and click Save Changes
          instead.
        </p>
        <RegenerateFieldForm articleId={article.id} field="didYouKnow" label="Did You Know?" />
        <RegenerateFieldForm articleId={article.id} field="perspective" label="Perspective" />

        {fieldRequests.length > 0 && (
          <div className="flex flex-col gap-1 border-t border-border pt-3">
            <span className="font-mono text-xs uppercase tracking-widest text-muted">
              Free Rewrite Requests
            </span>
            {fieldRequests.map((r) => (
              <p key={r.id} className="font-mono text-xs text-muted">
                {r.field === "didYouKnow" ? "Did You Know?" : "Perspective"} — &quot;{r.question}&quot; —{" "}
                <span
                  className={
                    r.status === "PENDING"
                      ? "text-gold"
                      : r.status === "FULFILLED"
                        ? "text-accent-strong"
                        : "text-danger"
                  }
                >
                  {r.status}
                </span>
                {r.note ? ` (${r.note})` : ""}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
