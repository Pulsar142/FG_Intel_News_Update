"use client";

import { useEffect, useState } from "react";

export function QuickBrief({ bullets }: { bullets: string[] }) {
  const [pinned, setPinned] = useState(false);
  const [hovering, setHovering] = useState(false);
  // Touch browsers fire a synthetic mouseenter on tap with no matching
  // mouseleave until you tap elsewhere, so hover state would otherwise get
  // stuck "on" forever after the first tap. Only trust real hover on
  // devices that report actual hover/pointer capability.
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);
  const open = pinned || (canHover && hovering);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => canHover && setHovering(true)}
      onMouseLeave={() => canHover && setHovering(false)}
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
