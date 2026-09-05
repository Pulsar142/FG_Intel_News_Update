import { startOfWeek, format } from "date-fns";

/** Monday of the week containing `date` (weekStartsOn: 1 = Monday), at midnight. */
export function mondayOf(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function weekLabel(weekOf: Date): string {
  return `Week of ${format(weekOf, "d MMM yyyy")}`;
}

export function monthLabel(month: number, year: number): string {
  return format(new Date(year, month - 1, 1), "MMMM yyyy");
}
