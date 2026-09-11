"use client";

import { useEffect, useMemo, useState } from "react";

type BriefPoint = {
  month: number;
  year: number;
  militaryIncidentCount: number;
  commercialIncidentCount: number;
};

const MILITARY_COLOR = "#3987e5";
const COMMERCIAL_COLOR = "#d95926";

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Sized for a narrow side panel (~260-300px rendered width) so the SVG's
// fixed-size text doesn't scale down into illegibility.
const WIDTH = 280;
const HEIGHT = 200;
const PAD_LEFT = 24;
const PAD_RIGHT = 10;
const PAD_TOP = 14;
const PAD_BOTTOM = 26;

const COLLAPSE_KEY = "aviationSafetyTrendChartCollapsed";

export function AviationSafetyTrendChart({ data }: { data: BriefPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      // ignore — default expanded
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        // ignore — collapse state just won't persist
      }
      return next;
    });
  }

  const plot = useMemo(() => {
    const n = data.length;
    const maxRaw = Math.max(1, ...data.map((d) => Math.max(d.militaryIncidentCount, d.commercialIncidentCount)));
    // Round the axis max up to a clean step (1, 2, 5, 10, 20, 25, 50...).
    const step = maxRaw <= 5 ? 1 : maxRaw <= 10 ? 2 : maxRaw <= 25 ? 5 : maxRaw <= 50 ? 10 : 20;
    const axisMax = Math.ceil(maxRaw / step) * step;
    const innerW = WIDTH - PAD_LEFT - PAD_RIGHT;
    const innerH = HEIGHT - PAD_TOP - PAD_BOTTOM;

    const x = (i: number) => (n <= 1 ? PAD_LEFT + innerW / 2 : PAD_LEFT + (innerW * i) / (n - 1));
    const y = (v: number) => PAD_TOP + innerH - (innerH * v) / axisMax;

    const militaryPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.militaryIncidentCount)}`).join(" ");
    const commercialPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.commercialIncidentCount)}`).join(" ");

    const yTicks = 3;
    const ticks = Array.from({ length: yTicks + 1 }, (_, i) => (axisMax / yTicks) * i);

    return { axisMax, x, y, militaryPath, commercialPath, ticks, innerH };
  }, [data]);

  const header = (
    <div className="flex items-center justify-between gap-2">
      <p className="stencil text-xs tracking-widest text-foreground">Military vs Commercial Trend</p>
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expand chart" : "Minimize chart"}
        className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted transition-colors hover:border-accent hover:text-foreground"
      >
        {collapsed ? "▸" : "▾"}
      </button>
    </div>
  );

  if (data.length === 0) {
    return (
      <div className="rounded border border-border bg-panel p-3">
        {header}
        {!collapsed && (
          <p className="mt-2 font-mono text-[10px] text-muted">
            No monthly trend data yet — a chart will appear here once the first monthly brief is generated.
          </p>
        )}
      </div>
    );
  }

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;
  const latest = data[data.length - 1];

  return (
    <div className="rounded border border-border bg-panel p-3">
      {header}

      <div className="mt-2 flex items-center gap-3 font-mono text-[10px] text-muted">
        <span className="flex items-center gap-1">
          <svg width="12" height="4" aria-hidden="true">
            <line x1="0" y1="2" x2="12" y2="2" stroke={MILITARY_COLOR} strokeWidth="2" strokeLinecap="round" />
          </svg>
          Military
        </span>
        <span className="flex items-center gap-1">
          <svg width="12" height="4" aria-hidden="true">
            <line x1="0" y1="2" x2="12" y2="2" stroke={COMMERCIAL_COLOR} strokeWidth="2" strokeLinecap="round" />
          </svg>
          Commercial
        </span>
      </div>

      {collapsed ? (
        <p className="mt-2 font-mono text-[10px] text-muted">
          Latest ({MONTH_ABBR[latest.month - 1]} {latest.year}):{" "}
          <span className="text-foreground">{latest.militaryIncidentCount} mil</span> /{" "}
          <span className="text-foreground">{latest.commercialIncidentCount} comm</span>
        </p>
      ) : (
        <>
          <div className="relative mt-2">
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="w-full"
              role="img"
              aria-label="Line chart of monthly military and commercial aviation safety incident counts"
              onPointerMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
                let nearest = 0;
                let nearestDist = Infinity;
                data.forEach((_, i) => {
                  const dist = Math.abs(plot.x(i) - relX);
                  if (dist < nearestDist) {
                    nearestDist = dist;
                    nearest = i;
                  }
                });
                setHoverIndex(nearest);
              }}
              onPointerLeave={() => setHoverIndex(null)}
            >
              {/* gridlines */}
              {plot.ticks.map((t, i) => (
                <g key={i}>
                  <line
                    x1={PAD_LEFT}
                    x2={WIDTH - PAD_RIGHT}
                    y1={plot.y(t)}
                    y2={plot.y(t)}
                    stroke="var(--border)"
                    strokeWidth="1"
                  />
                  <text x={PAD_LEFT - 6} y={plot.y(t)} textAnchor="end" dominantBaseline="middle" className="fill-muted" fontSize="8">
                    {Math.round(t)}
                  </text>
                </g>
              ))}

              {/* x-axis labels */}
              {data.map((d, i) => (
                <text
                  key={i}
                  x={plot.x(i)}
                  y={HEIGHT - PAD_BOTTOM + 14}
                  textAnchor="middle"
                  className="fill-muted"
                  fontSize="8"
                >
                  {MONTH_ABBR[d.month - 1]} {String(d.year).slice(2)}
                </text>
              ))}

              {/* crosshair */}
              {hoverIndex !== null && (
                <line
                  x1={plot.x(hoverIndex)}
                  x2={plot.x(hoverIndex)}
                  y1={PAD_TOP}
                  y2={PAD_TOP + plot.innerH}
                  stroke="var(--muted)"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              )}

              {/* lines */}
              <path d={plot.militaryPath} fill="none" stroke={MILITARY_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d={plot.commercialPath} fill="none" stroke={COMMERCIAL_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

              {/* markers */}
              {data.map((d, i) => (
                <g key={i}>
                  <circle cx={plot.x(i)} cy={plot.y(d.militaryIncidentCount)} r="3.5" fill={MILITARY_COLOR} stroke="var(--panel)" strokeWidth="1.5" />
                  <circle cx={plot.x(i)} cy={plot.y(d.commercialIncidentCount)} r="3.5" fill={COMMERCIAL_COLOR} stroke="var(--panel)" strokeWidth="1.5" />
                  {/* transparent hit target */}
                  <rect
                    x={plot.x(i) - (data.length > 1 ? (WIDTH - PAD_LEFT - PAD_RIGHT) / (data.length - 1) / 2 : WIDTH / 2)}
                    y={PAD_TOP}
                    width={data.length > 1 ? (WIDTH - PAD_LEFT - PAD_RIGHT) / (data.length - 1) : WIDTH - PAD_LEFT - PAD_RIGHT}
                    height={plot.innerH}
                    fill="transparent"
                    onPointerEnter={() => setHoverIndex(i)}
                  />
                </g>
              ))}
            </svg>

            {hovered && (
              <div className="pointer-events-none absolute right-1 top-1 rounded border border-border bg-background/95 px-2 py-1.5 font-mono text-[9px]">
                <p className="mb-0.5 text-muted">
                  {MONTH_ABBR[hovered.month - 1]} {hovered.year}
                </p>
                <p className="flex items-center gap-1 text-foreground">
                  <svg width="8" height="3" aria-hidden="true">
                    <line x1="0" y1="1.5" x2="8" y2="1.5" stroke={MILITARY_COLOR} strokeWidth="2" />
                  </svg>
                  Mil: <span className="font-semibold">{hovered.militaryIncidentCount}</span>
                </p>
                <p className="flex items-center gap-1 text-foreground">
                  <svg width="8" height="3" aria-hidden="true">
                    <line x1="0" y1="1.5" x2="8" y2="1.5" stroke={COMMERCIAL_COLOR} strokeWidth="2" />
                  </svg>
                  Comm: <span className="font-semibold">{hovered.commercialIncidentCount}</span>
                </p>
              </div>
            )}
          </div>

          <div className="mt-2 overflow-x-auto">
            <table className="w-full font-mono text-[9px] text-muted">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-1 pr-2 font-normal">Month</th>
                  <th className="py-1 pr-2 font-normal">Mil</th>
                  <th className="py-1 font-normal">Comm</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1 pr-2">
                      {MONTH_ABBR[d.month - 1]} {d.year}
                    </td>
                    <td className="py-1 pr-2 text-foreground">{d.militaryIncidentCount}</td>
                    <td className="py-1 text-foreground">{d.commercialIncidentCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
