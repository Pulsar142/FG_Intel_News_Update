import "server-only";

export type FlightCategory = "VFR" | "MVFR" | "IFR" | "LIFR";
export type RunwayCondition = "Dry" | "Damp" | "Wet";

export type AerodromeWeather = {
  icaoCode: string;
  stationName: string | null;
  flightCategory: FlightCategory | null;
  ceilingFt: number | null; // null = no ceiling (no BKN/OVC layer reported)
  visibilitySm: string | null; // e.g. "10+", "3", "1/2"
  runwayCondition: RunwayCondition;
  runwayConditionIsInferred: true; // no free global RCC/SNOWTAM feed exists — always a heuristic from present weather
  wxString: string | null;
  tempC: number | null;
  windSummary: string | null;
  rawObservation: string;
  observedAt: string; // ISO timestamp of the METAR observation
};

type RawMetar = {
  icaoId?: string;
  name?: string;
  fltCat?: string;
  visib?: string | number;
  wxString?: string;
  temp?: number;
  wdir?: number | string;
  wspd?: number;
  rawOb?: string;
  reportTime?: string;
  obsTime?: number;
  clouds?: { cover?: string; base?: number }[];
};

const WET_CODES = ["RA", "SH", "TS", "DZ", "GR", "GS", "PL", "SN", "SG", "IC", "UP"];
const DAMP_CODES = ["BR", "FG", "FZFG", "HZ"];

function inferRunwayCondition(wxString: string | null): RunwayCondition {
  if (!wxString) return "Dry";
  const upper = wxString.toUpperCase();
  if (WET_CODES.some((code) => upper.includes(code))) return "Wet";
  if (DAMP_CODES.some((code) => upper.includes(code))) return "Damp";
  return "Dry";
}

function ceilingFromClouds(clouds: RawMetar["clouds"]): number | null {
  if (!clouds || clouds.length === 0) return null;
  const layer = clouds.find((c) => c.cover === "BKN" || c.cover === "OVC");
  return layer && typeof layer.base === "number" ? layer.base : null;
}

function windSummary(wdir: number | string | undefined, wspd: number | undefined): string | null {
  if (wspd === undefined) return null;
  if (wdir === "VRB" || wdir === undefined) return `Variable at ${wspd} kt`;
  return `${String(wdir).padStart(3, "0")}° at ${wspd} kt`;
}

/**
 * Fetches the latest METAR for one ICAO station from NOAA's Aviation Weather
 * Center — a free, public, no-key-required feed. Returns null if the
 * station has no live METAR reporting on file (common for smaller/military
 * fields with no civil weather station) rather than fabricating a report.
 */
export async function fetchAerodromeWeather(icaoCode: string): Promise<AerodromeWeather | null> {
  const id = icaoCode.trim().toUpperCase();
  if (!/^[A-Z0-9]{4}$/.test(id)) return null;

  const response = await fetch(
    `https://aviationweather.gov/api/data/metar?ids=${encodeURIComponent(id)}&format=json`,
    { next: { revalidate: 300 } }
  );
  if (!response.ok) return null;

  const data = (await response.json()) as RawMetar[];
  const metar = data[0];
  if (!metar || !metar.rawOb) return null;

  const wxString = metar.wxString ?? null;
  const fltCat = metar.fltCat;
  const flightCategory: FlightCategory | null =
    fltCat === "VFR" || fltCat === "MVFR" || fltCat === "IFR" || fltCat === "LIFR" ? fltCat : null;

  return {
    icaoCode: id,
    stationName: metar.name ?? null,
    flightCategory,
    ceilingFt: ceilingFromClouds(metar.clouds),
    visibilitySm: metar.visib !== undefined ? String(metar.visib) : null,
    runwayCondition: inferRunwayCondition(wxString),
    runwayConditionIsInferred: true,
    wxString,
    tempC: metar.temp ?? null,
    windSummary: windSummary(metar.wdir, metar.wspd),
    rawObservation: metar.rawOb,
    observedAt: metar.reportTime ?? new Date(1000 * (metar.obsTime ?? 0)).toISOString(),
  };
}
