import { format } from "date-fns";

/**
 * Monday (UTC midnight) of the UTC week containing `date`. Computed in UTC
 * explicitly, not the process's local timezone — every `weekOf` in this app
 * is stored/compared as a UTC-midnight date, and the scheduled maintenance
 * jobs that call this (weekly generation, weekly archive) run in sessions
 * whose local timezone isn't guaranteed to be UTC. Using date-fns's
 * `startOfWeek` (local-time-based) here previously meant a job firing after
 * UTC midnight, but before local midnight in a timezone behind UTC, would
 * compute the wrong (previous) Monday and silently skip archiving that week.
 */
export function mondayOf(date: Date): Date {
  const utcMidnight = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utcMidnight.getUTCDay(); // 0 = Sunday ... 6 = Saturday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  utcMidnight.setUTCDate(utcMidnight.getUTCDate() + diffToMonday);
  return utcMidnight;
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
