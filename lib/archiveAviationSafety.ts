import "server-only";
import { db } from "@/lib/db";

/**
 * Archives every PUBLISHED Aviation Safety briefing from a prior week — run
 * weekly, ahead of that week's new briefings landing, so a published
 * briefing lives on the public page for about a week before moving to the
 * archive. Mirrors lib/publish.ts's archivePriorWeeks() for regular Articles.
 */
export async function archivePriorAviationSafetyWeeks(currentWeekOf: Date) {
  await db.aviationSafetyArticle.updateMany({
    where: { status: "PUBLISHED", weekOf: { lt: currentWeekOf } },
    data: { status: "ARCHIVED" },
  });
}
