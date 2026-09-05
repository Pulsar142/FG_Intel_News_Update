import type { Region } from "@/generated/prisma/client";

export type SourceDef = {
  name: string;
  url: string;
};

/**
 * Curated source list, grouped by region. This is the exact list supplied by
 * the admin. Edit this file to add/remove sources — no other code changes
 * needed, the generation pipeline reads from here.
 */
export const SOURCES: Record<Region, SourceDef[]> = {
  SINGAPORE: [
    { name: "DSTA News Releases", url: "https://www.dsta.gov.sg/whats-on/news-releases" },
    { name: "The Straits Times", url: "https://www.straitstimes.com/global" },
    { name: "Channel News Asia", url: "https://www.channelnewsasia.com/east-asia" },
    { name: "Defence Security Asia", url: "https://defencesecurityasia.com/" },
  ],
  SEA: [
    { name: "Defence Security Asia", url: "https://defencesecurityasia.com/" },
    { name: "Channel News Asia", url: "https://www.channelnewsasia.com/east-asia" },
    { name: "The Straits Times", url: "https://www.straitstimes.com/global" },
    { name: "JANES", url: "https://www.janes.com/osint-insights/defence-news" },
  ],
  GLOBAL: [
    { name: "JANES", url: "https://www.janes.com/osint-insights/defence-news" },
    { name: "Reuters", url: "https://www.reuters.com/world/asia-pacific/" },
    { name: "Modern War Institute", url: "https://mwi.westpoint.edu" },
    { name: "Army Technology", url: "https://www.army-technology.com" },
    { name: "Air Force Technology", url: "https://www.airforce-technology.com/sector/military-fixed-wing/" },
  ],
  USA: [
    { name: "JANES", url: "https://www.janes.com/osint-insights/defence-news" },
    { name: "Modern War Institute", url: "https://mwi.westpoint.edu" },
    { name: "Army Technology", url: "https://www.army-technology.com" },
    { name: "Air Force Technology", url: "https://www.airforce-technology.com/sector/military-fixed-wing/" },
    { name: "Reuters", url: "https://www.reuters.com/world/asia-pacific/" },
  ],
  MALAYSIA: [
    { name: "Malaysian Defence News", url: "https://www.malaysiandefence.com/" },
    { name: "Defence Security Asia", url: "https://defencesecurityasia.com/" },
  ],
  INDONESIA: [
    { name: "Indonesia Defence Magazine", url: "https://indonesiadefense.com/en/" },
    { name: "Defence Security Asia", url: "https://defencesecurityasia.com/" },
  ],
  CUSTOM: [
    { name: "JANES", url: "https://www.janes.com/osint-insights/defence-news" },
    { name: "Reuters", url: "https://www.reuters.com/world/asia-pacific/" },
    { name: "Defence Security Asia", url: "https://defencesecurityasia.com/" },
  ],
};

/**
 * Military/defence relevance keywords, drawn directly from the admin's brief:
 * new developments & procurement, ongoing tensions, aircraft, weapons/payloads,
 * SAM systems, radar, stealth, UAS, next-gen fighters, recon, space, indigenous
 * programs, sea-to-air threats.
 */
export const RELEVANCE_KEYWORDS = [
  "fighter jet", "transport aircraft", "helicopter", "air-to-air", "air-to-ground",
  "surface-to-air", "SAM system", "long-range weapon", "rocket launcher", "radar",
  "stealth", "unmanned aerial", "UAV", "UAS", "drone", "next-generation fighter",
  "next-gen fighter", "payload", "reconnaissance", "ISR", "space", "orbital",
  "satellite", "indigenous", "procurement", "acquisition", "modernisation",
  "modernization", "air defence", "air defense", "missile", "submarine", "carrier",
  "frigate", "destroyer", "naval", "cruise missile", "ballistic missile",
  "military exercise", "defence budget", "defense budget", "arms deal", "MRCA",
  "loitering munition", "counter-drone", "electronic warfare", "cyber warfare",
];

export const REGION_LABELS: Record<Region, string> = {
  SINGAPORE: "Singapore",
  SEA: "South-East Asia",
  GLOBAL: "Global",
  USA: "USA",
  MALAYSIA: "Malaysia",
  INDONESIA: "Indonesia",
  CUSTOM: "Custom",
};

export const CORE_REGIONS: Region[] = ["SINGAPORE", "SEA", "GLOBAL", "USA"];
export const OPTIONAL_REGIONS: Region[] = ["MALAYSIA", "INDONESIA"];
