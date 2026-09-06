import Link from "next/link";
import { weekLabel } from "@/lib/weeks";
import { REGION_LABELS } from "@/lib/sources";
import type { DigestArticle } from "@/lib/queries";

export function WeeklyBriefing({
  weekOf,
  articles,
}: {
  weekOf: Date;
  articles: DigestArticle[];
}) {
  return (
    <div className="rounded border border-gold/40 bg-panel p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="stencil text-sm tracking-widest text-gold">This Week&apos;s Briefing</p>
        <p className="font-mono text-[10px] text-muted">{weekLabel(weekOf)}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/article/${a.slug}`}
            className="rounded border border-border bg-panel-2 px-3 py-1.5 font-mono text-xs text-foreground transition-colors hover:border-accent hover:text-accent-strong"
          >
            <span className="text-gold">
              {REGION_LABELS[a.region]}
              {a.country ? ` · ${a.country}` : ""}
            </span>
            <span className="text-muted"> — </span>
            {a.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
