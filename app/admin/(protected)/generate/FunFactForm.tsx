"use client";

import { useState, useActionState } from "react";
import { generateFunFactAction, requestFreeFunFactAction } from "@/app/actions/admin";

export function FunFactForm() {
  const [topic, setTopic] = useState("");
  const [freeState, freeAction, freePending] = useActionState(requestFreeFunFactAction, undefined);
  const [paidState, paidAction, paidPending] = useActionState(generateFunFactAction, undefined);

  return (
    <div className="flex flex-col gap-2 rounded border border-gold/40 bg-panel p-4">
      <p className="stencil text-xs tracking-widest text-gold">Request a Military Fun Fact</p>
      <p className="text-xs text-muted">
        Type a topic (fighter jets, submarines, stealth technology, radar, …) or leave it blank for
        a random one. Every fact is web-search-verified against a reliable source before it's saved
        — never invented.
      </p>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="e.g. air-to-air missiles, submarines… or leave blank"
        className="rounded border border-border bg-panel-2 px-3 py-2 text-foreground outline-none focus:border-accent"
      />
      <div className="flex flex-wrap gap-2">
        <form action={freeAction}>
          <input type="hidden" name="topic" value={topic} />
          <button
            type="submit"
            disabled={freePending}
            className="stencil rounded border border-accent px-4 py-2 text-xs font-semibold tracking-widest text-accent-strong hover:bg-accent hover:text-background transition-colors disabled:opacity-60"
          >
            {freePending ? "Queuing…" : "Request (Free)"}
          </button>
        </form>
        <form action={paidAction}>
          <input type="hidden" name="topic" value={topic} />
          <button
            type="submit"
            disabled={paidPending}
            className="stencil rounded border border-gold px-4 py-2 text-xs font-semibold tracking-widest text-gold hover:bg-gold hover:text-background transition-colors disabled:opacity-60"
          >
            {paidPending ? "Generating…" : "Generate (Instant)"}
          </button>
        </form>
      </div>
      {freeState?.error && <p className="font-mono text-xs text-danger">{freeState.error}</p>}
      {freeState?.ok && (
        <p className="font-mono text-xs text-accent-strong">
          Queued — picked up within about an hour by the free-generation Routine.
        </p>
      )}
      {paidState?.error && <p className="font-mono text-xs text-danger">{paidState.error}</p>}
      {paidState?.ok && (
        <p className="font-mono text-xs text-accent-strong">Fact added — see the list below.</p>
      )}
    </div>
  );
}
