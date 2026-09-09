import Link from "next/link";
import type { AviationSafetyRegion } from "@/generated/prisma/client";
import { AVIATION_SAFETY_REGION_LABELS } from "@/lib/aviationSafety";

export function AviationSafetyRegionTabs({ active }: { active?: AviationSafetyRegion }) {
  const regions: AviationSafetyRegion[] = ["ASIA", "GLOBAL"];
  return (
    <nav className="scrollbar-olive flex gap-2 overflow-x-auto pb-1">
      <Link
        href="/aviation-safety"
        className={`stencil shrink-0 rounded-full border px-4 py-1.5 text-xs tracking-widest transition-colors ${
          !active
            ? "border-accent bg-accent text-background"
            : "border-border text-muted hover:text-foreground"
        }`}
      >
        All
      </Link>
      {regions.map((r) => (
        <Link
          key={r}
          href={`/aviation-safety?region=${r}`}
          className={`stencil shrink-0 rounded-full border px-4 py-1.5 text-xs tracking-widest transition-colors ${
            active === r
              ? "border-accent bg-accent text-background"
              : "border-border text-muted hover:text-foreground"
          }`}
        >
          {AVIATION_SAFETY_REGION_LABELS[r]}
        </Link>
      ))}
    </nav>
  );
}
