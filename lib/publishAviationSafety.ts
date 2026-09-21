import "server-only";
import { db } from "@/lib/db";
import { archivePriorAviationSafetyWeeks } from "@/lib/archiveAviationSafety";

/**
 * Publishes an Aviation Safety briefing, mirroring publishArticle() in
 * lib/publish.ts: archives every prior week's published briefings first, so
 * old ones don't linger on the public page indefinitely just because
 * nothing new happened to trigger the weekly archive Routine. Unlike
 * regular Articles (one published slot per region/week), briefings report
 * genuinely separate incidents, so several can stay published within the
 * same region/week — this only archives strictly older weeks, never a
 * same-week sibling.
 */
export async function publishAviationSafetyArticle(articleId: string) {
  const article = await db.aviationSafetyArticle.findUniqueOrThrow({ where: { id: articleId } });
  await archivePriorAviationSafetyWeeks(article.weekOf);
  await db.aviationSafetyArticle.update({
    where: { id: articleId },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
}
