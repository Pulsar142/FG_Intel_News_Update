import {
  getPublishedAviationSafetyArticles,
  getLatestAviationSafetyBrief,
  getAviationSafetyBriefHistory,
} from "@/lib/queries";
import { getSession } from "@/lib/session";
import { SiteHeader } from "@/app/components/SiteHeader";
import { AviationSafetyRegionTabs } from "@/app/components/AviationSafetyRegionTabs";
import { AviationSafetyCardView } from "@/app/components/AviationSafetyCardView";
import { AviationSafetyTrendChart } from "@/app/components/AviationSafetyTrendChart";
import type { AviationSafetyRegion } from "@/generated/prisma/client";

export default async function AviationSafetyPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const { region } = await searchParams;
  const activeRegion = region === "ASIA" || region === "GLOBAL" ? (region as AviationSafetyRegion) : undefined;
  const [articles, brief, briefHistory] = await Promise.all([
    getPublishedAviationSafetyArticles(activeRegion),
    getLatestAviationSafetyBrief(),
    getAviationSafetyBriefHistory(),
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
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <p className="max-w-xl font-mono text-xs text-muted">
                  <span className="stencil text-[10px] tracking-widest text-[#3987e5]">Military — </span>
                  {brief.militaryTrendHighlight}
                </p>
                <p className="max-w-xl font-mono text-xs text-muted">
                  <span className="stencil text-[10px] tracking-widest text-[#d95926]">Commercial — </span>
                  {brief.commercialTrendHighlight}
                </p>
              </div>
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

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="order-2 min-w-0 flex-1 lg:order-1">
            <AviationSafetyRegionTabs active={activeRegion} />

            {articles.length === 0 ? (
              <p className="mt-8 text-center text-muted font-mono text-sm">
                No Aviation Safety briefings to show yet.
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((a) => (
                  <AviationSafetyCardView key={a.id} article={a} />
                ))}
              </div>
            )}
          </div>

          <aside className="order-1 shrink-0 lg:sticky lg:top-20 lg:order-2 lg:w-72">
            <AviationSafetyTrendChart
              data={briefHistory.map((b) => ({
                month: b.month,
                year: b.year,
                militaryIncidentCount: b.militaryIncidentCount,
                commercialIncidentCount: b.commercialIncidentCount,
              }))}
            />
          </aside>
        </div>
      </main>
      <footer className="border-t border-border px-4 py-4 text-center font-mono text-[10px] text-muted">
        KNOWLEDGE BEFORE CONFLICT — open-source intelligence, not an official government publication.
      </footer>
    </>
  );
}
