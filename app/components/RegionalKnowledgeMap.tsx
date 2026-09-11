"use client";

import "leaflet/dist/leaflet.css";
import { useMemo, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Feature } from "geojson";
import { AIRBASE_UNIT_CATEGORY_LABELS, hasFlyingUnit } from "@/lib/regionalKnowledge";
import type { ArticleSource } from "@/lib/types";

export type AirbaseUnitData = {
  id: string;
  category: keyof typeof AIRBASE_UNIT_CATEGORY_LABELS;
  unitName: string;
  aircraftType: string | null;
  approxCount: number | null;
  notes: string | null;
  sources: string;
};

export type AirbaseMapData = {
  id: string;
  slug: string;
  name: string;
  country: string;
  operator: string;
  latitude: number;
  longitude: number;
  icaoCode: string | null;
  baseType: "MILITARY" | "CIVIL_MILITARY_SHARED";
  description: string;
  sources: string;
  units: AirbaseUnitData[];
};

// Fixed categorical hues, one per focus country (validated CVD-safe order).
const COUNTRY_COLORS: Record<string, string> = {
  Singapore: "#3987e5",
  Malaysia: "#d95926",
  Indonesia: "#199e70",
  Brunei: "#c98500",
  Philippines: "#d55181",
  Vietnam: "#008300",
  Thailand: "#9085e9",
  Cambodia: "#e66767",
};
const DEFAULT_BORDER = "#6b6f5a";

const FLYING_MARKER_COLOR = "#c9a227"; // gold — hosts a flying squadron
const GROUND_MARKER_COLOR = "#b5432c"; // rust — ground-only installation (air defence / ammo depot / support)

function airbaseIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="7" fill="${color}" stroke="#12150f" stroke-width="2" />
    </svg>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -9],
  });
}

function FitToBorders({ geojson }: { geojson: GeoJSON.FeatureCollection | null }) {
  const map = useMap();
  useMemo(() => {
    if (!geojson) return;
    const layer = L.geoJSON(geojson);
    const bounds = layer.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [16, 16] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geojson]);
  return null;
}

export function RegionalKnowledgeMap({
  airbases,
  geojson,
}: {
  airbases: AirbaseMapData[];
  geojson: GeoJSON.FeatureCollection | null;
}) {
  const [activeCountry, setActiveCountry] = useState<string | null>(null);

  const visibleAirbases = activeCountry ? airbases.filter((a) => a.country === activeCountry) : airbases;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 font-mono text-[10px]">
        <button
          onClick={() => setActiveCountry(null)}
          className={`stencil rounded-full border px-3 py-1 tracking-widest transition-colors ${
            activeCountry === null ? "border-accent bg-accent text-background" : "border-border text-muted hover:text-foreground"
          }`}
        >
          All
        </button>
        {Object.keys(COUNTRY_COLORS).concat(["South China Sea"]).map((c) => (
          <button
            key={c}
            onClick={() => setActiveCountry(c)}
            className={`stencil rounded-full border px-3 py-1 tracking-widest transition-colors ${
              activeCountry === c ? "text-background" : "border-border text-muted hover:text-foreground"
            }`}
            style={activeCountry === c ? { backgroundColor: COUNTRY_COLORS[c] ?? DEFAULT_BORDER, borderColor: COUNTRY_COLORS[c] ?? DEFAULT_BORDER } : undefined}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="h-[520px] w-full overflow-hidden rounded border border-border">
        <MapContainer center={[6, 111]} zoom={4} scrollWheelZoom className="h-full w-full" style={{ background: "#12150f" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geojson && (
            <GeoJSON
              data={geojson}
              style={(feature?: Feature) => {
                const name = feature?.properties?.name as string | undefined;
                const color = (name && COUNTRY_COLORS[name]) || DEFAULT_BORDER;
                return { color, weight: 2, fillColor: color, fillOpacity: 0.08 };
              }}
              onEachFeature={(feature, layer) => {
                const name = feature?.properties?.name as string | undefined;
                if (name) layer.bindTooltip(name, { sticky: true, className: "rk-tooltip" });
              }}
            />
          )}
          <FitToBorders geojson={geojson} />

          {visibleAirbases.map((a) => {
            const flying = hasFlyingUnit(a.units.map((u) => u.category));
            const sources = JSON.parse(a.sources) as ArticleSource[];
            return (
              <Marker key={a.id} position={[a.latitude, a.longitude]} icon={airbaseIcon(flying ? FLYING_MARKER_COLOR : GROUND_MARKER_COLOR)}>
                <Popup maxWidth={280}>
                  <div className="flex flex-col gap-1.5 font-mono text-xs">
                    <p className="text-[10px] uppercase tracking-widest text-muted">
                      {a.country} — {a.baseType === "CIVIL_MILITARY_SHARED" ? "Civil/Military Shared" : "Military"}
                    </p>
                    <p className="text-sm font-semibold">{a.name}</p>
                    <p className="text-muted">{a.operator}</p>
                    <p>{a.description}</p>
                    <div className="mt-1 flex flex-col gap-1 border-t border-black/10 pt-1">
                      {a.units.map((u) => (
                        <div key={u.id}>
                          <p className="text-[10px] uppercase tracking-widest text-muted">
                            {AIRBASE_UNIT_CATEGORY_LABELS[u.category]}
                          </p>
                          <p className="font-semibold">
                            {u.unitName}
                            {u.aircraftType ? ` — ${u.aircraftType}` : ""}
                            {u.approxCount ? ` (~${u.approxCount})` : ""}
                          </p>
                          {u.notes && <p className="text-muted">{u.notes}</p>}
                        </div>
                      ))}
                    </div>
                    <div className="mt-1 flex flex-col gap-0.5 border-t border-black/10 pt-1 text-[10px] text-muted">
                      {sources.map((s, i) => (
                        <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="underline">
                          {s.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <p className="font-mono text-[10px] text-muted">
        <span className="mr-3">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: FLYING_MARKER_COLOR }} /> flying squadron present
        </span>
        <span>
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: GROUND_MARKER_COLOR }} /> ground installation only (air defence / ammo depot / support)
        </span>
      </p>
    </div>
  );
}
