import { weekLabel } from "@/lib/weeks";

export function WeeklyBriefing({
  weekOf,
  summaryText,
}: {
  weekOf: Date;
  summaryText: string;
}) {
  return (
    <div className="rounded border border-gold/40 bg-panel p-4 sm:p-5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="stencil text-sm tracking-widest text-gold">This Week&apos;s Briefing</p>
        <p className="font-mono text-[10px] text-muted">{weekLabel(weekOf)}</p>
      </div>
      <p className="text-sm leading-relaxed text-foreground">{summaryText}</p>
    </div>
  );
}
