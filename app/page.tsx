import Link from "next/link";
import type { Region } from "@/generated/prisma/client";
import {
  getArchiveTree,
  getArticlesForWeek,
  getCurrentDigest,
  getEnabledRegions,
  getFunFacts,
  getPublishedArticles,
} from "@/lib/queries";
import { getSession } from "@/lib/session";
import { SiteHeader } from "@/app/components/SiteHeader";
import { RegionTabs } from "@/app/components/RegionTabs";
import { ArchiveSidebar } from "@/app/components/ArchiveSidebar";
import { MilitaryFunFacts } from "@/app/components/MilitaryFunFacts";
import { ArticleCardView } from "@/app/components/ArticleCardView";
import { WeeklyBriefing } from "@/app/components/WeeklyBriefing";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; week?: string }>;
}) {
  const { region, week } = await searchParams;
  const session = await getSession();
  const enabledRegions = await getEnabledRegions();
  const activeRegion = enabledRegions.includes(region as Region) ? (region as Region) : undefined;

  const [digest, archiveTree, funFacts] = await Promise.all([
    getCurrentDigest(),
    getArchiveTree(),
    getFunFacts(),
  ]);

  let articles;
  if (week) {
    const weekOf = new Date(`${week}T00:00:00.000Z`);
    articles = await getArticlesForWeek(weekOf);
    if (activeRegion) articles = articles.filter((a) => a.region === activeRegion);
  } else {
    articles = await getPublishedArticles(activeRegion);
  }

  return (
    <>
      <SiteHeader role={session?.role ?? null} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
        {digest && !week && digest.articles.length > 0 && (
          <WeeklyBriefing weekOf={digest.weekOf} articles={digest.articles} />
        )}

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex flex-col gap-4 lg:shrink-0">
            <MilitaryFunFacts facts={funFacts} />
            <ArchiveSidebar tree={archiveTree} activeWeek={week} />
          </div>
          <div className="flex-1 min-w-0">
            <RegionTabs regions={enabledRegions} active={activeRegion} />

            {week && (
              <p className="mt-4 font-mono text-xs text-muted">
                Showing archived briefing for the week selected in the sidebar.{" "}
                <Link href="/" className="text-accent underline">
                  Back to current week
                </Link>
              </p>
            )}

            {articles.length === 0 ? (
              <p className="mt-8 text-center text-muted font-mono text-sm">
                No briefings to show yet.
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((a) => (
                  <ArticleCardView key={a.id} article={a} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="border-t border-border px-4 py-4 text-center font-mono text-[10px] text-muted">
        KNOWLEDGE BEFORE CONFLICT — open-source intelligence, not an official government publication.
      </footer>
    </>
  );
}
