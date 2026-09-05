import "server-only";
import { db } from "@/lib/db";

/** Archives every PUBLISHED article from a prior week once a new week goes live. */
export async function archivePriorWeeks(currentWeekOf: Date) {
  await db.article.updateMany({
    where: { status: "PUBLISHED", weekOf: { lt: currentWeekOf } },
    data: { status: "ARCHIVED" },
  });
}

/**
 * Publishes an article, archiving both prior weeks' published articles and
 * any other already-published article in the same region/week (so
 * publishing a freshly generated draft doubles as "swap the pre-generated
 * news" for that slot, even after the original was already published).
 */
export async function publishArticle(articleId: string) {
  const article = await db.article.findUniqueOrThrow({ where: { id: articleId } });
  await archivePriorWeeks(article.weekOf);
  await db.article.updateMany({
    where: {
      status: "PUBLISHED",
      weekOf: article.weekOf,
      region: article.region,
      id: { not: articleId },
    },
    data: { status: "ARCHIVED" },
  });
  await db.article.update({
    where: { id: articleId },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
  await refreshDigest(article.weekOf);
}

function firstSentence(text: string): string {
  const match = text.match(/^.*?[.!?](\s|$)/);
  return (match ? match[0] : text).trim();
}

/** Rebuilds the week's digest roundup from whatever is currently published for it. */
export async function refreshDigest(weekOf: Date) {
  const published = await db.article.findMany({ where: { status: "PUBLISHED", weekOf } });
  if (published.length === 0) return;
  const summaryText = published.map((a) => firstSentence(a.summaryP1)).join(" ");
  const articleIds = published.map((a) => a.id);
  await db.weeklyDigest.upsert({
    where: { weekOf },
    update: { summaryText, articleIds: JSON.stringify(articleIds) },
    create: { weekOf, summaryText, articleIds: JSON.stringify(articleIds) },
  });
}
