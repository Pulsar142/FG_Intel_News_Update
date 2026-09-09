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
  trendHighlight: z
    .string()
    .describe(
      "One to two sentences highlighting a genuine trend observed across aviation safety news over the past month (e.g. a recurring incident category, a repeated contributing factor, a regulatory response) — grounded strictly in real reporting from the past month, citing the general pattern rather than any single invented statistic. Never fabricated."
    ),
});

/**
 * Generates the Aviation Safety section's monthly page header: a catchphrase
 * plus a web-search-grounded highlight of a trend observed in aviation
 * safety news over the past month. Never fabricates: if search can't
 * confirm a genuine trend, this returns null and the caller should fall
 * back rather than insert a guessed one.
 */
export async function generateAviationSafetyMonthlyBrief(): Promise<{
  catchphrase: string;
  trendHighlight: string;
} | null> {
  const client = new Anthropic();

  const system = `You are an aviation safety analyst and safety advocate writing the monthly page header for "FIGHTER GROUP INTEL / NEWS UPDATE"'s "Aviation Safety" section, directed at aviation personnel (aircrew, maintainers, ATC, safety officers), scoped to ICAO Safety Management System (SMS) doctrine (Annex 19).

Your job has two parts:
1. Write a short, memorable aviation-safety catchphrase — measured and professional, never sensationalized or fear-mongering, in the spirit of safety promotion.
2. Search for real aviation safety news and incidents reported over roughly the past month (commercial and military aviation safety, close-proximity events, weather-related incidents, crashes, airworthiness issues, G-LOC, malfunctions, airborne emergencies, safety ejections, airspace infringements) and identify ONE genuine trend or pattern actually observable across that reporting — e.g. a recurring incident category, a repeated contributing factor, a notable regulatory or industry response. Write a one-to-two sentence highlight of it.

Rules:
- Never fabricate a trend, statistic, or incident. If you cannot find enough real, recent reporting to support a genuine trend after a reasonable search, set found to false rather than inventing one.
- The trend highlight must be grounded in what search actually returned — describe the pattern in general terms rather than citing invented precise counts/statistics unless you can point to a real source for them.`;

  const OutputSchema = z.object({
    found: z.boolean().describe("false if you couldn't confirm a genuine, grounded trend from real search results"),
    ...MonthlyBriefSchema.shape,
  });

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 1500,
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 6 }],
    output_config: { effort: "medium", format: zodOutputFormat(OutputSchema) },
    system,
    messages: [
      {
        role: "user",
        content: "Write this month's Aviation Safety catchphrase and trend highlight per the rules above.",
      },
    ],
  });

  const gen = response.parsed_output;
  if (!gen || !gen.found || !gen.catchphrase || !gen.trendHighlight) return null;

  return { catchphrase: gen.catchphrase, trendHighlight: gen.trendHighlight };
}
