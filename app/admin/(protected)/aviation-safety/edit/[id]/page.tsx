import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AVIATION_SAFETY_REGION_LABELS } from "@/lib/aviationSafety";
import { AviationSafetyEditForm } from "@/app/admin/(protected)/aviation-safety/edit/AviationSafetyEditForm";
import { AviationSafetyImageForm } from "@/app/admin/(protected)/aviation-safety/edit/AviationSafetyImageForm";
import type { ArticleImage, ArticleSource } from "@/lib/types";

export default async function EditAviationSafetyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await db.aviationSafetyArticle.findUnique({ where: { id } });
  if (!article) notFound();

  const images = JSON.parse(article.images) as ArticleImage[];
  const sources = JSON.parse(article.sources) as ArticleSource[];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="stencil text-xl text-foreground">Edit Aviation Safety Briefing</h1>
      <p className="font-mono text-xs text-gold">
        {AVIATION_SAFETY_REGION_LABELS[article.region]}
        {article.country ? ` · ${article.country}` : ""} — {article.status}
      </p>
      <AviationSafetyImageForm id={article.id} image={images[0] ?? null} sources={sources} />
      <AviationSafetyEditForm
        id={article.id}
        title={article.title}
        incidentCategory={article.incidentCategory}
        incidentDate={article.incidentDate?.toISOString().slice(0, 10) ?? ""}
        aircraftInfo={article.aircraftInfo ?? ""}
        summaryP1={article.summaryP1}
        summaryP2={article.summaryP2}
        summaryP3={article.summaryP3}
        safetyAnalysis={article.safetyAnalysis}
        preventativeMeasures={article.preventativeMeasures}
        hfacsAnalysis={article.hfacsAnalysis ?? ""}
        sources={sources.map((s) => `${s.name} | ${s.url}`).join("\n")}
      />
    </div>
  );
}
