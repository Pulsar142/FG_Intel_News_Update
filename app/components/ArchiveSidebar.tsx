import Link from "next/link";
import type { ArchiveMonth } from "@/lib/queries";
import { monthLabel, weekLabel } from "@/lib/weeks";

function ArchiveTree({ tree, activeWeek }: { tree: ArchiveMonth[]; activeWeek?: string }) {
  if (tree.length === 0) {
    return <p className="text-sm text-muted font-mono">No archived briefings yet.</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {tree.map((m) => (
        <div key={`${m.year}-${m.month}`}>
          <p className="stencil mb-1 text-xs tracking-widest text-gold">
            {monthLabel(m.month, m.year)}
          </p>
          <ul className="flex flex-col gap-1 border-l border-border pl-3">
            {m.weeks.map((w) => {
              const iso = w.weekOf.toISOString().slice(0, 10);
              const active = activeWeek === iso;
              return (
                <li key={iso}>
                  <Link
                    href={`/?week=${iso}`}
                    className={`block rounded px-2 py-1 text-sm transition-colors ${
                      active
                        ? "bg-accent text-background font-medium"
                        : "text-muted hover:text-foreground hover:bg-panel-2"
                    }`}
                  >
                    {weekLabel(w.weekOf)}{" "}
                    <span className="font-mono text-xs opacity-70">({w.count})</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function ArchiveSidebar({ tree, activeWeek }: { tree: ArchiveMonth[]; activeWeek?: string }) {
  return (
    <>
      <details className="mb-4 rounded border border-border bg-panel lg:hidden">
        <summary className="stencil cursor-pointer px-4 py-3 text-sm tracking-widest text-foreground">
          Archive
        </summary>
        <div className="scrollbar-olive max-h-80 overflow-y-auto border-t border-border p-4">
          <ArchiveTree tree={tree} activeWeek={activeWeek} />
        </div>
      </details>
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-20 rounded border border-border bg-panel p-4">
          <p className="stencil mb-3 text-sm tracking-widest text-foreground">Archive</p>
          <div className="scrollbar-olive max-h-[70vh] overflow-y-auto">
            <ArchiveTree tree={tree} activeWeek={activeWeek} />
          </div>
        </div>
      </aside>
    </>
  );
}
