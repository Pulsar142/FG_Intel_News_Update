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
  source: string; // which feed this observation came from, for attribution
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
const FETCH_TIMEOUT_MS = 8000;

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

function windSummaryFromParts(wdir: number | string | undefined, wspd: number | undefined): string | null {
  if (wspd === undefined) return null;
  if (wdir === "VRB" || wdir === undefined) return `Variable at ${wspd} kt`;
  return `${String(wdir).padStart(3, "0")}° at ${wspd} kt`;
}

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Primary source: NOAA/FAA's Aviation Weather Center data API — free, public,
 * no key required, and gives us a pre-computed flight category alongside
 * structured cloud/visibility fields.
 */
async function fetchFromAviationWeatherGov(id: string): Promise<AerodromeWeather | null> {
  const response = await fetchWithTimeout(
    `https://aviationweather.gov/api/data/metar?ids=${encodeURIComponent(id)}&format=json`,
    { next: { revalidate: 300 }, headers: { Accept: "application/json" } }
  );
  if (!response || !response.ok) return null;

  let data: RawMetar[];
  try {
    data = (await response.json()) as RawMetar[];
  } catch {
    return null;
  }

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
    windSummary: windSummaryFromParts(metar.wdir, metar.wspd),
    rawObservation: metar.rawOb,
    observedAt: metar.reportTime ?? new Date(1000 * (metar.obsTime ?? 0)).toISOString(),
    source: "NOAA Aviation Weather Center",
  };
}

function visibilityFromToken(token: string): { display: string; scoreSm: number } | null {
  if (/^\d{4}$/.test(token)) {
    const meters = parseInt(token, 10);
    if (meters >= 9999) return { display: "10+", scoreSm: 10 };
    const sm = meters / 1609.344;
    return { display: sm.toFixed(1), scoreSm: sm };
  }
  const usMatch = token.match(/^(P)?(\d{1,2})(?:\/(\d{1,2}))?SM$/);
  if (usMatch) {
    const [, plus, whole, frac] = usMatch;
    const value = frac ? parseInt(whole, 10) / parseInt(frac, 10) : parseInt(whole, 10);
    return { display: plus ? `${whole}+` : frac ? `${whole}/${frac}` : whole, scoreSm: value };
  }
  return null;
}

function categoryFromCeilingAndVis(ceilingFt: number | null, visScoreSm: number | null): FlightCategory | null {
  if (ceilingFt === null && visScoreSm === null) return null;
  if ((ceilingFt !== null && ceilingFt < 500) || (visScoreSm !== null && visScoreSm < 1)) return "LIFR";
  if ((ceilingFt !== null && ceilingFt < 1000) || (visScoreSm !== null && visScoreSm < 3)) return "IFR";
  if ((ceilingFt !== null && ceilingFt <= 3000) || (visScoreSm !== null && visScoreSm <= 5)) return "MVFR";
  return "VFR";
}

// Reconstructs a full observation timestamp from a METAR's day/hour/minute
// group (it carries no month/year of its own) against the current UTC clock.
function observedAtFromDayHourMinute(dhm: string): string {
  const day = parseInt(dhm.slice(0, 2), 10);
  const hour = parseInt(dhm.slice(2, 4), 10);
  const minute = parseInt(dhm.slice(4, 6), 10);
  const now = new Date();
  let candidate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), day, hour, minute));
  if (candidate.getTime() - now.getTime() > 24 * 60 * 60 * 1000) {
    candidate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, day, hour, minute));
  }
  return candidate.toISOString();
}

function parseRawMetar(id: string, raw: string, source: string): AerodromeWeather | null {
  const tokens = raw.trim().toUpperCase().split(/\s+/).filter((t) => t !== "METAR" && t !== "SPECI" && t !== "AUTO" && t !== "COR");
  if (tokens.length === 0) return null;

  const dhmToken = tokens.find((t) => /^\d{6}Z$/.test(t));
  const observedAt = dhmToken ? observedAtFromDayHourMinute(dhmToken) : new Date().toISOString();

  if (tokens.includes("CAVOK")) {
    return {
      icaoCode: id,
      stationName: null,
      flightCategory: "VFR",
      ceilingFt: null,
      visibilitySm: "10+ (CAVOK)",
      runwayCondition: "Dry",
      runwayConditionIsInferred: true,
      wxString: null,
      tempC: null,
      windSummary: null,
      rawObservation: raw.trim(),
      observedAt,
      source,
    };
  }

  const windToken = tokens.find((t) => /^(\d{3}|VRB)\d{2,3}(G\d{2,3})?KT$/.test(t));
  let windSummary: string | null = null;
  if (windToken) {
    const m = windToken.match(/^(\d{3}|VRB)(\d{2,3})(?:G\d{2,3})?KT$/)!;
    windSummary = m[1] === "VRB" ? `Variable at ${parseInt(m[2], 10)} kt` : `${m[1]}° at ${parseInt(m[2], 10)} kt`;
  }

  let visibilityDisplay: string | null = null;
  let visScoreSm: number | null = null;
  let visIndex = -1;
  tokens.forEach((t, i) => {
    if (visIndex !== -1) return;
    if (/^\d{3}V\d{3}$/.test(t)) return; // variable wind direction group, not visibility
    const parsed = visibilityFromToken(t);
    if (parsed) {
      visibilityDisplay = parsed.display;
      visScoreSm = parsed.scoreSm;
      visIndex = i;
    }
  });

  const cloudTokens = tokens.filter((t) => /^(FEW|SCT|BKN|OVC)\d{3}(CB|TCU)?$/.test(t) || /^VV\d{3}$/.test(t));
  let ceilingFt: number | null = null;
  for (const t of cloudTokens) {
    const cover = t.slice(0, t.startsWith("VV") ? 2 : 3);
    if (cover === "BKN" || cover === "OVC" || cover === "VV") {
      ceilingFt = parseInt(t.match(/\d{3}/)![0], 10) * 100;
      break;
    }
  }
  const noCeilingMarker = tokens.some((t) => t === "NSC" || t === "NCD" || t === "SKC" || t === "CLR");

  const cloudStartIndex = cloudTokens.length > 0 ? tokens.indexOf(cloudTokens[0]) : -1;
  const wxTokens =
    visIndex !== -1
      ? tokens.slice(visIndex + 1, cloudStartIndex !== -1 ? cloudStartIndex : tokens.length).filter((t) => !/^\d{3}V\d{3}$/.test(t))
      : [];
  const wxString = wxTokens.length > 0 ? wxTokens.join(" ") : null;

  const tempMatch = tokens.find((t) => /^M?\d{2}\/M?\d{2}$/.test(t));
  const tempC = tempMatch ? parseInt(tempMatch.split("/")[0].replace("M", "-"), 10) : null;

  const flightCategory = categoryFromCeilingAndVis(noCeilingMarker ? null : ceilingFt, visScoreSm);

  return {
    icaoCode: id,
    stationName: null,
    flightCategory,
    ceilingFt: noCeilingMarker ? null : ceilingFt,
    visibilitySm: visibilityDisplay,
    runwayCondition: inferRunwayCondition(wxString),
    runwayConditionIsInferred: true,
    wxString,
    tempC,
    windSummary,
    rawObservation: raw.trim(),
    observedAt,
    source,
  };
}

/**
 * Fallback source: VATSIM's public METAR relay, which mirrors the same
 * underlying NOAA/ICAO network as plain text. Used only when the primary
 * NOAA data API doesn't answer, so a transient block/outage on one feed
 * doesn't take the whole feature down.
 */
async function fetchFromVatsimRelay(id: string): Promise<AerodromeWeather | null> {
  const response = await fetchWithTimeout(`https://metar.vatsim.net/${encodeURIComponent(id)}`);
  if (!response || !response.ok) return null;
  const text = (await response.text()).trim();
  if (!text || !text.toUpperCase().startsWith(id)) return null;
  return parseRawMetar(id, text, "VATSIM METAR relay (NOAA/ICAO network)");
}

/**
 * Fetches the latest METAR for one ICAO station, trying two independent
 * free, no-key feeds in order, so a hiccup on one doesn't take the feature
 * down. Returns null (never a guessed report) if neither has a live METAR
 * on file for this station — common for smaller/military fields with no
 * civil weather station.
 */
export async function fetchAerodromeWeather(icaoCode: string): Promise<AerodromeWeather | null> {
  const id = icaoCode.trim().toUpperCase();
  if (!/^[A-Z0-9]{4}$/.test(id)) return null;

  try {
    const primary = await fetchFromAviationWeatherGov(id);
    if (primary) return primary;
  } catch {
    // fall through to the secondary source
  }

  try {
    return await fetchFromVatsimRelay(id);
  } catch {
    return null;
  }
}
