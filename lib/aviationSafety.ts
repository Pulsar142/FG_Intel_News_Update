import type { AviationSafetyRegion } from "@/generated/prisma/client";

export const AVIATION_SAFETY_REGION_LABELS: Record<AviationSafetyRegion, string> = {
  ASIA: "Asia",
  GLOBAL: "Global",
  CUSTOM: "Custom",
};

export const AVIATION_SAFETY_REGIONS: AviationSafetyRegion[] = ["ASIA", "GLOBAL", "CUSTOM"];
