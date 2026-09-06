import { startOfWeek, format } from "date-fns";

/** Monday of the week containing `date` (weekStartsOn: 1 = Monday), at midnight. */
export function mondayOf(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function weekLabel(weekOf: Date): string {
  return `Week of ${format(weekOf, "d MMM yyyy")}`;
}

/** The exact date an article went live, falling back to its week if it was never published. */
export function publishedDateLabel(publishedAt: Date | null, weekOf: Date): string {
  return `Published ${format(publishedAt ?? weekOf, "d MMM yyyy")}`;
}

/** Compact form of the same date, for tight card layouts. */
export function shortDateLabel(publishedAt: Date | null, weekOf: Date): string {
  return format(publishedAt ?? weekOf, "d MMM yyyy");
}

export function monthLabel(month: number, year: number): string {
  return format(new Date(year, month - 1, 1), "MMMM yyyy");
}
