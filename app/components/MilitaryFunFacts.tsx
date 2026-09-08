import type { FunFact } from "@/generated/prisma/client";

function Fact({ fact }: { fact: FunFact }) {
  return (
    <div className="border-l border-border pl-3">
      <p className="text-sm leading-relaxed text-foreground">{fact.text}</p>
      {fact.sourceUrl && (
        <a
          href={fact.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block font-mono text-[10px] text-accent hover:text-accent-strong hover:underline"
        >
          {fact.sourceName ?? "Source"} ↗
        </a>
      )}
    </div>
  );
}

/** Shows the single currently-published fun fact — nothing renders when none is published. */
export function MilitaryFunFacts({ fact }: { fact: FunFact | null }) {
  if (!fact) return null;

  return (
    <>
      <details className="mb-4 rounded border border-gold/40 bg-panel lg:hidden">
        <summary className="stencil cursor-pointer px-4 py-3 text-sm tracking-widest text-gold">
          Military Fun Facts
        </summary>
        <div className="border-t border-border p-4">
          <Fact fact={fact} />
        </div>
      </details>
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="rounded border border-gold/40 bg-panel p-4">
          <p className="stencil mb-3 text-sm tracking-widest text-gold">Military Fun Facts</p>
          <Fact fact={fact} />
        </div>
      </aside>
    </>
  );
}
