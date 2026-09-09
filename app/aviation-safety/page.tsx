import { getPublishedAviationSafetyArticles, getLatestAviationSafetyBrief } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { SiteHeader } from "@/app/components/SiteHeader";
import { AviationSafetyRegionTabs } from "@/app/components/AviationSafetyRegionTabs";
import { AviationSafetyCardView } from "@/app/components/AviationSafetyCardView";
import type { AviationSafetyRegion } from "@/generated/prisma/client";

export default async function AviationSafetyPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const { region } = await searchParams;
  const activeRegion = region === "ASIA" || region === "GLOBAL" ? (region as AviationSafetyRegion) : undefined;
  const [articles, brief] = await Promise.all([
    getPublishedAviationSafetyArticles(activeRegion),
    getLatestAviationSafetyBrief(),
  ]);

  return (
    <>
      <SiteHeader role={(await getSession())?.role ?? null} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
        <div>
          <h1 className="stencil text-2xl text-foreground">Aviation Safety</h1>
          {brief ? (
            <>
              <p className="mt-2 max-w-3xl font-mono text-xs italic text-gold">{brief.catchphrase}</p>
              <p className="mt-1 max-w-3xl font-mono text-xs text-muted">{brief.trendHighlight}</p>
            </>
          ) : (
            <p className="mt-2 max-w-3xl font-mono text-xs text-muted">
              Grounded incident briefings for aviation personnel, scoped to ICAO Safety Management
              System (SMS) doctrine — each with a 5-Why / fishbone Safety Analysis, concrete
              Preventative Measures, and an HFACS categorisation where human factors genuinely
              apply. Never sensationalized, never fabricated.
            </p>
          )}
        </div>

        <AviationSafetyRegionTabs active={activeRegion} />

        {articles.length === 0 ? (
          <p className="mt-8 text-center text-muted font-mono text-sm">
            No Aviation Safety briefings to show yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <AviationSafetyCardView key={a.id} article={a} />
            ))}
          </div>
        )}
      </main>
      <footer className="border-t border-border px-4 py-4 text-center font-mono text-[10px] text-muted">
        KNOWLEDGE BEFORE CONFLICT — open-source intelligence, not an official government publication.
      </footer>
    </>
  );
}
