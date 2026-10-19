import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { mondayOf } from "@/lib/weeks";
import { archivePriorWeeks, refreshDigest } from "@/lib/publish";
import { archivePriorAviationSafetyWeeks } from "@/lib/archiveAviationSafety";

export const maxDuration = 60;

/**
 * Deterministic, AI-free backstop for archiving prior weeks' published
 * content. Runs as a real Vercel Cron job rather than an ad-hoc agent
 * session, because the agent-run version of this job (a scheduled
 * Claude Code Remote Routine) repeatedly reported success while silently
 * failing to perform the archive — this route calls the same app-code
 * archive functions directly, so there's no script/session in between
 * that can skip the write while still reporting it happened.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const currentWeekOf = mondayOf(new Date());

  const staleWeeks = (
    await db.article.findMany({
      where: { status: "PUBLISHED", weekOf: { lt: currentWeekOf } },
      select: { weekOf: true },
      distinct: ["weekOf"],
    })
  ).map((r) => r.weekOf);

  const [articlesResult, aviationSafetyResult] = await Promise.all([
    archivePriorWeeks(currentWeekOf),
    archivePriorAviationSafetyWeeks(currentWeekOf),
  ]);

  for (const weekOf of staleWeeks) {
    await refreshDigest(weekOf);
  }

  const remainingArticles = await db.article.count({
    where: { status: "PUBLISHED", weekOf: { lt: currentWeekOf } },
  });
  const remainingAviationSafety = await db.aviationSafetyArticle.count({
    where: { status: "PUBLISHED", weekOf: { lt: currentWeekOf } },
  });

  return Response.json({
    success: true,
    currentWeekOf,
    articlesArchived: articlesResult.count,
    aviationSafetyArchived: aviationSafetyResult.count,
    digestsRefreshed: staleWeeks.length,
    remainingStale: { articles: remainingArticles, aviationSafety: remainingAviationSafety },
  });
}
