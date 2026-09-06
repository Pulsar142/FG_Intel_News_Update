import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { REGION_LABELS } from "@/lib/sources";
import { EditForm } from "@/app/admin/(protected)/edit/EditForm";
import { ImageForm } from "@/app/admin/(protected)/edit/ImageForm";
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

  return (
    <div className="flex flex-col gap-4">
      <h1 className="stencil text-xl text-foreground">Edit Article</h1>
      <p className="font-mono text-xs text-gold">
        {REGION_LABELS[article.region]}
        {article.country ? ` · ${article.country}` : ""} — {article.status}
      </p>
      <ImageForm articleId={article.id} image={images[0] ?? null} sources={sources} />
      <EditForm
        articleId={article.id}
        title={article.title}
        summaryP1={article.summaryP1}
        summaryP2={article.summaryP2}
        didYouKnow={article.didYouKnow}
        perspective={article.perspective}
        bullets={JSON.parse(article.bullets)}
      />
    </div>
  );
}
