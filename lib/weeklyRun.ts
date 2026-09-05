import "server-only";
import { db } from "@/lib/db";
import { getMonth, getYear } from "date-fns";
import type { Region } from "@/generated/prisma/client";
import { fetchCandidatesForRegion } from "@/lib/fetchCandidates";
import { searchWebCandidates } from "@/lib/webSearchCandidates";
import { crossCheck } from "@/lib/crossCheck";
import { generateArticleDraft } from "@/lib/generateArticle";
import { mondayOf } from "@/lib/weeks";
import { publishArticle } from "@/lib/publish";
import { CORE_REGIONS, OPTIONAL_REGIONS } from "@/lib/sources";

export class NoCandidatesError extends Error {
  constructor(region: string) {
    super(`No relevant, dated candidates found for ${region}. Try again later or widen the cutoff.`);
  }
}

/**
 * Fetches candidates for a region (optionally filtered to a specific
 * country), cross-checks the best one for corroboration, and generates a
 * DRAFT article via the Claude API. Does not publish — call publishArticle
 * separately, or pass autoPublish via runWeeklyGeneration.
 */
export async function generateDraftForRegion(
  region: Region,
  options: { country?: string; weekOf?: Date } = {}
) {
  const weekOf = options.weekOf ?? mondayOf(new Date());

  // Combine the curated RSS source list with a live web search — the RSS
  // list alone shouldn't be the only way stories get found, and web search
  // is best-effort (it's skipped, not fatal, if it errors or finds nothing).
  const [rssCandidates, webCandidates] = await Promise.all([
    fetchCandidatesForRegion(region, { countryFilter: options.country }),
    searchWebCandidates(region, { country: options.country }).catch(() => []),
  ]);
  const candidates = [...rssCandidates, ...webCandidates];

  if (candidates.length === 0) throw new NoCandidatesError(options.country ?? region);

  // Most recent first; fall back to the first candidate found if none carry a date.
  const sorted = [...candidates].sort(
    (a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0)
  );
  const chosen = sorted[0];
  const { reliabilityScore, corroboratingSources } = crossCheck(chosen, candidates);

  const draft = await generateArticleDraft({
    region,
    country: options.country,
    candidate: chosen,
    corroboratingSources,
    weekOf,
  });
  draft.reliabilityScore = reliabilityScore;

  const article = await db.article.create({
    data: {
      slug: draft.slug,
      title: draft.title,
      region: draft.region,
      country: draft.country,
      status: "DRAFT",
      summaryP1: draft.summaryP1,
      summaryP2: draft.summaryP2,
      didYouKnow: draft.didYouKnow,
      perspective: draft.perspective,
      bullets: JSON.stringify(draft.bullets),
      images: JSON.stringify(draft.images),
      sources: JSON.stringify(draft.sources),
      reliabilityScore: draft.reliabilityScore,
      weekOf: draft.weekOf,
      month: getMonth(draft.weekOf) + 1,
      year: getYear(draft.weekOf),
      createdBy: "bot",
    },
  });

  return article;
}

/**
 * The weekly Monday-morning run: generates one draft per enabled region and,
 * by default, publishes them immediately (archiving the previous week),
 * matching the "auto generated and published" requirement. Regions with no
 * usable candidates are skipped, not fatal to the run.
 */
export async function runWeeklyGeneration(options: { autoPublish?: boolean } = {}) {
  const { autoPublish = true } = options;
  const weekOf = mondayOf(new Date());

  const regionSettings = await db.regionSetting.findMany();
  const disabled = new Set(regionSettings.filter((r) => !r.enabled).map((r) => r.region));
  const regions = [...CORE_REGIONS, ...OPTIONAL_REGIONS].filter((r) => !disabled.has(r));

  const created: { region: Region; articleId: string | null; error?: string }[] = [];

  for (const region of regions) {
    try {
      const article = await generateDraftForRegion(region, { weekOf });
      created.push({ region, articleId: article.id });
    } catch (e) {
      created.push({ region, articleId: null, error: e instanceof Error ? e.message : String(e) });
    }
  }

  if (autoPublish) {
    for (const c of created) {
      if (!c.articleId) continue;
      await publishArticle(c.articleId);
    }
  }

  return created;
}
