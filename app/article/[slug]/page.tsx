import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { SiteHeader } from "@/app/components/SiteHeader";
import { QuickBrief } from "@/app/components/QuickBrief";
import { ReliabilityBadge } from "@/app/components/ReliabilityBadge";
import { REGION_LABELS } from "@/lib/sources";
import { storyDateLabel } from "@/lib/weeks";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [article, session] = await Promise.all([getArticleBySlug(slug), getSession()]);

  if (!article || article.status === "DRAFT") notFound();

  const perspectiveParagraphs = article.perspective.split("\n\n").filter(Boolean);

  return (
    <>
      <SiteHeader role={session?.role ?? null} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <p className="stencil mb-2 text-xs tracking-widest text-gold">
          {REGION_LABELS[article.region]}
          {article.country ? ` · ${article.country}` : ""} —{" "}
          {storyDateLabel(article.articleDate, article.publishedAt, article.weekOf)}
        </p>
        <h1 className="stencil mb-3 text-2xl leading-tight text-foreground sm:text-3xl">
          {article.title}
        </h1>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <ReliabilityBadge score={article.reliabilityScore} />
          <QuickBrief bullets={article.bullets} />
        </div>

        {article.images.length > 0 && (
          <div className={`mb-6 grid gap-3 ${article.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {article.images.slice(0, 2).map((img, i) => (
              <figure key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element -- external source images */}
                <img
                  src={img.url}
                  alt={img.caption}
                  className="w-full rounded border border-border object-cover"
                />
                {img.caption && (
                  <figcaption className="mt-1 font-mono text-[10px] text-muted">
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}

        <article className="flex flex-col gap-4 text-[15px] leading-relaxed text-foreground">
          <p>{article.summaryP1}</p>
          <p>{article.summaryP2}</p>
          {article.summaryP3 && <p>{article.summaryP3}</p>}
        </article>

        <div className="mt-6 rounded border border-border bg-panel p-4">
          <p className="stencil mb-2 text-xs tracking-widest text-accent-strong">Did You Know?</p>
          <p className="text-sm leading-relaxed text-foreground">{article.didYouKnow}</p>
        </div>

        {!article.perspectiveHidden && (
          <div className="mt-4 rounded border border-gold/40 bg-panel p-4">
            <p className="stencil mb-2 text-xs tracking-widest text-gold">
              {article.region === "SINGAPORE" || perspectiveParagraphs.length === 1
                ? "Singapore's Perspective"
                : "Perspectives"}
            </p>
            <div className="flex flex-col gap-3 text-sm leading-relaxed text-foreground">
              {perspectiveParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 border-t border-border pt-4">
          <p className="stencil mb-2 text-xs tracking-widest text-muted">
            Sources ({article.reliabilityScore} corroborating)
          </p>
          <ul className="flex flex-col gap-1 font-mono text-xs">
            {article.sources.map((s, i) => (
              <li key={i}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-strong hover:underline"
                >
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
