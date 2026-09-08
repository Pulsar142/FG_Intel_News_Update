import type { FunFact } from "@/generated/prisma/client";

function FactList({ facts }: { facts: FunFact[] }) {
  if (facts.length === 0) {
    return <p className="text-sm text-muted font-mono">No fun facts yet.</p>;
  }
  return (
    <ul className="flex flex-col gap-3">
      {facts.map((f) => (
        <li key={f.id} className="border-l border-border pl-3">
          <p className="text-sm leading-relaxed text-foreground">{f.text}</p>
          {f.sourceUrl && (
            <a
              href={f.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block font-mono text-[10px] text-accent hover:text-accent-strong hover:underline"
            >
              {f.sourceName ?? "Source"} ↗
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

export function MilitaryFunFacts({ facts }: { facts: FunFact[] }) {
  return (
    <>
      <details className="mb-4 rounded border border-gold/40 bg-panel lg:hidden">
        <summary className="stencil cursor-pointer px-4 py-3 text-sm tracking-widest text-gold">
          Military Fun Facts
        </summary>
        <div className="border-t border-border p-4">
          <FactList facts={facts} />
        </div>
      </details>
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="rounded border border-gold/40 bg-panel p-4">
          <p className="stencil mb-3 text-sm tracking-widest text-gold">Military Fun Facts</p>
          <FactList facts={facts} />
        </div>
      </aside>
    </>
  );
}
