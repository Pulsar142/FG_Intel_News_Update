"use client";

import dynamic from "next/dynamic";
import type { AirbaseMapData } from "@/app/components/RegionalKnowledgeMap";

const Map = dynamic(() => import("@/app/components/RegionalKnowledgeMap").then((m) => m.RegionalKnowledgeMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] w-full items-center justify-center rounded border border-border bg-panel font-mono text-xs text-muted">
      Loading map…
    </div>
  ),
});

export function RegionalKnowledgeMapLoader({
  airbases,
  geojson,
}: {
  airbases: AirbaseMapData[];
  geojson: GeoJSON.FeatureCollection | null;
}) {
  return <Map airbases={airbases} geojson={geojson} />;
}
