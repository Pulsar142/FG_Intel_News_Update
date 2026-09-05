"use client";

import { useState } from "react";

export function QuickBrief({ bullets }: { bullets: string[] }) {
  const [pinned, setPinned] = useState(false);
  const [hovering, setHovering] = useState(false);
  const open = pinned || hovering;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <button
        type="button"
        onClick={() => setPinned((v) => !v)}
        aria-expanded={open}
        className="stencil rounded border border-gold px-4 py-2 text-xs tracking-widest text-gold hover:bg-gold hover:text-background transition-colors"
      >
        Quick Brief ▾
      </button>
      {open && (
        <div
          role="tooltip"
          className="absolute left-0 top-full z-40 mt-2 w-72 rounded border border-border bg-panel p-4 shadow-2xl sm:w-96"
        >
          <p className="stencil mb-2 text-[11px] tracking-widest text-gold">
            60-Second Brief
          </p>
          <ul className="flex flex-col gap-1.5">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground">
                <span className="mt-0.5 text-accent">▸</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
