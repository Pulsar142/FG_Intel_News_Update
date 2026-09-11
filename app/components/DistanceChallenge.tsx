"use client";

import { useMemo, useState } from "react";
import { COUNTRY_CENTROIDS } from "@/lib/countryCentroids";
import { haversineKm, kmToNm } from "@/lib/distance";

type AirbaseOption = { id: string; name: string; country: string; latitude: number; longitude: number };

export function DistanceChallenge({ airbases }: { airbases: AirbaseOption[] }) {
  const [airbaseId, setAirbaseId] = useState(airbases[0]?.id ?? "");
  const [countryName, setCountryName] = useState("China");
  const [result, setResult] = useState<{ airbase: AirbaseOption; country: string; km: number } | null>(null);

  const sortedCountries = useMemo(() => [...COUNTRY_CENTROIDS].sort((a, b) => a.name.localeCompare(b.name)), []);

  function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    const airbase = airbases.find((a) => a.id === airbaseId);
    const country = COUNTRY_CENTROIDS.find((c) => c.name === countryName);
    if (!airbase || !country) return;
    const km = haversineKm({ lat: airbase.latitude, lng: airbase.longitude }, { lat: country.lat, lng: country.lng });
    setResult({ airbase, country: country.name, km });
  }

  const field = "rounded border border-border bg-panel-2 px-3 py-2 text-foreground outline-none focus:border-accent";

  return (
    <div className="rounded border border-border bg-panel p-4">
      <p className="stencil mb-1 text-xs tracking-widest text-foreground">Challenge &amp; Response</p>
      <p className="mb-3 font-mono text-[10px] text-muted">
        Ask: distance of an airbase to any country. Computed by great-circle (haversine) distance to that
        country&apos;s geographic centroid — no guessing, just geometry.
      </p>

      <form onSubmit={handleAsk} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Airbase</span>
          <select value={airbaseId} onChange={(e) => setAirbaseId(e.target.value)} className={field}>
            {airbases.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.country})
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-1 flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Distance to</span>
          <select value={countryName} onChange={(e) => setCountryName(e.target.value)} className={field}>
            {sortedCountries.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="stencil rounded bg-accent px-5 py-2 text-xs font-semibold tracking-widest text-background hover:bg-accent-strong transition-colors"
        >
          Ask
        </button>
      </form>

      {result && (
        <p className="mt-3 font-mono text-sm text-foreground">
          <span className="text-accent-strong">{result.airbase.name}</span> is approximately{" "}
          <span className="font-semibold text-gold">{Math.round(result.km).toLocaleString()} km</span> (
          {Math.round(kmToNm(result.km)).toLocaleString()} nm) from {result.country}&apos;s geographic centroid.
        </p>
      )}
    </div>
  );
}
