import Link from "next/link";
import type { Region } from "@/generated/prisma/client";
import { REGION_LABELS } from "@/lib/sources";

export function RegionTabs({
  regions,
  active,
}: {
  regions: Region[];
  active?: Region;
}) {
  return (
    <nav className="scrollbar-olive flex gap-2 overflow-x-auto pb-1">
      <Link
        href="/"
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
          href={`/?region=${r}`}
          className={`stencil shrink-0 rounded-full border px-4 py-1.5 text-xs tracking-widest transition-colors ${
            active === r
              ? "border-accent bg-accent text-background"
              : "border-border text-muted hover:text-foreground"
          }`}
        >
          {REGION_LABELS[r]}
        </Link>
      ))}
    </nav>
  );
}
