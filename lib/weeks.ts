import { startOfWeek, format } from "date-fns";

/** Monday of the week containing `date` (weekStartsOn: 1 = Monday), at midnight. */
export function mondayOf(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function weekLabel(weekOf: Date): string {
  return `Week of ${format(weekOf, "d MMM yyyy")}`;
}

/**
 * The date of the underlying news story itself — not when we published it.
 * Prefers articleDate (the source's own publish date); falls back to our
 * own publishedAt, then the bucketed week, for older rows that predate
 * articleDate or where the source's date genuinely couldn't be determined.
 */
export function storyDateLabel(articleDate: Date | null, publishedAt: Date | null, weekOf: Date): string {
  return format(articleDate ?? publishedAt ?? weekOf, "d MMM yyyy");
}

export function monthLabel(month: number, year: number): string {
  return format(new Date(year, month - 1, 1), "MMMM yyyy");
}
