import type { AviationSafetyRegion } from "@/generated/prisma/client";

export const AVIATION_SAFETY_REGION_LABELS: Record<AviationSafetyRegion, string> = {
  ASIA: "Asia",
  GLOBAL: "Global",
  EUROPE: "Europe",
  NORTH_AMERICA: "North America",
  CUSTOM: "Custom",
};

export const AVIATION_SAFETY_REGIONS: AviationSafetyRegion[] = [
  "ASIA",
  "GLOBAL",
  "EUROPE",
  "NORTH_AMERICA",
  "CUSTOM",
];

/** The fixed, filterable region tabs on the public Aviation Safety page — CUSTOM is excluded since it's a per-article ad-hoc country, not a browsable bucket. */
export const AVIATION_SAFETY_TAB_REGIONS: AviationSafetyRegion[] = ["ASIA", "GLOBAL", "EUROPE", "NORTH_AMERICA"];
