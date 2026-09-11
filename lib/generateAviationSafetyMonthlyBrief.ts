import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const MODEL = "claude-sonnet-5";

const MonthlyBriefSchema = z.object({
  catchphrase: z
    .string()
    .describe(
      "A short, punchy aviation-safety catchphrase (one line, under ~12 words) in the voice of a safety advocate — memorable, never sensationalized, never fear-mongering."
    ),
  militaryTrendHighlight: z
    .string()
    .describe(
      "One to two sentences highlighting a genuine trend observed specifically in MILITARY aviation safety news over the past month (e.g. a recurring incident category, a repeated contributing factor, a notable service/regulatory response) — grounded strictly in real reporting from the past month. If reporting was too sparse to identify a real pattern, say so plainly rather than inventing one."
    ),
  militaryIncidentCount: z
    .number()
    .int()
    .min(0)
    .describe(
      "The count of DISTINCT real military aviation safety incidents you actually found and could cite a source for while researching the trend above (not an estimate — count only what your searches actually turned up)."
    ),
  commercialTrendHighlight: z
    .string()
    .describe(
      "One to two sentences highlighting a genuine trend observed specifically in COMMERCIAL/civil aviation safety news over the past month — same grounding rules as the military highlight."
    ),
  commercialIncidentCount: z
    .number()
    .int()
    .min(0)
    .describe(
      "The count of DISTINCT real commercial/civil aviation safety incidents you actually found and could cite a source for while researching the trend above (not an estimate)."
    ),
});

/**
 * Generates the Aviation Safety section's monthly page header: a catchphrase
 * plus web-search-grounded Military and Commercial trend highlights, each
 * paired with a count of the distinct real incidents found for that sector —
 * the data point plotted on the section's Military vs Commercial trend
 * chart for that month. Never fabricates: if search can't confirm a genuine
 * trend, this returns null and the caller should fall back rather than
 * insert a guessed one.
 */
export async function generateAviationSafetyMonthlyBrief(): Promise<{
  catchphrase: string;
  militaryTrendHighlight: string;
  militaryIncidentCount: number;
  commercialTrendHighlight: string;
  commercialIncidentCount: number;
} | null> {
  const client = new Anthropic();

  const system = `You are an aviation safety analyst and safety advocate writing the monthly page header for "FIGHTER GROUP INTEL / NEWS UPDATE"'s "Aviation Safety" section, directed at aviation personnel (aircrew, maintainers, ATC, safety officers), scoped to ICAO Safety Management System (SMS) doctrine (Annex 19).

Your job has three parts:
1. Write a short, memorable aviation-safety catchphrase — measured and professional, never sensationalized or fear-mongering, in the spirit of safety promotion.
2. Search for real MILITARY aviation safety news and incidents reported over roughly the past month (military aircraft crashes, close-proximity events, weather-related incidents, airworthiness issues, G-LOC, malfunctions, airborne emergencies, safety ejections, airspace infringements involving military aircraft/air forces). Identify ONE genuine trend or pattern actually observable across that reporting, and separately tally the number of distinct real military incidents your searches actually turned up.
3. Do the same for COMMERCIAL/civil aviation safety news over the same period (airline, cargo, and general/civil aviation incidents of the same kinds).

Rules:
- Never fabricate a trend, statistic, or incident. If reporting for a sector was too sparse to identify a real pattern, say so plainly in that sector's highlight rather than inventing one — and set that sector's count to the honest (possibly low or zero) number you actually found.
- Each incident count must be the number of DISTINCT real incidents you can point to from your own searches this run — never an estimate, guess, or round number chosen for effect.
- Describe each trend in general terms grounded in what search actually returned — never cite an invented precise statistic.`;

  const OutputSchema = z.object({
    found: z.boolean().describe("false if you couldn't confirm genuine, grounded trends for at least one sector from real search results"),
    ...MonthlyBriefSchema.shape,
  });

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 2000,
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 10 }],
    output_config: { effort: "medium", format: zodOutputFormat(OutputSchema) },
    system,
    messages: [
      {
        role: "user",
        content: "Write this month's Aviation Safety catchphrase and the Military and Commercial trend highlights per the rules above.",
      },
    ],
  });

  const gen = response.parsed_output;
  if (
    !gen ||
    !gen.found ||
    !gen.catchphrase ||
    !gen.militaryTrendHighlight ||
    !gen.commercialTrendHighlight ||
    gen.militaryIncidentCount == null ||
    gen.commercialIncidentCount == null
  ) {
    return null;
  }

  return {
    catchphrase: gen.catchphrase,
    militaryTrendHighlight: gen.militaryTrendHighlight,
    militaryIncidentCount: gen.militaryIncidentCount,
    commercialTrendHighlight: gen.commercialTrendHighlight,
    commercialIncidentCount: gen.commercialIncidentCount,
  };
}
