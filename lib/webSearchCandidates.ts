import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Region } from "@/generated/prisma/client";
import { REGION_LABELS } from "@/lib/sources";
import type { Candidate } from "@/lib/fetchCandidates";

const MODEL = "claude-sonnet-5";

const WebCandidatesSchema = z.object({
  candidates: z
    .array(
      z.object({
        title: z.string().describe("The article's actual headline."),
        url: z.string().describe("Direct URL to the article, exactly as returned by search."),
        sourceName: z.string().describe("The outlet's name, e.g. 'Reuters' or 'Naval News'."),
        summary: z.string().describe("One-sentence summary of what the article reports."),
      })
    )
    .max(6),
});

/**
 * Supplements the curated RSS source list (lib/sources.ts) with a live web
 * search, so the pipeline isn't limited to a fixed set of outlets. Uses
 * Claude's own hosted web-search tool (billed as normal API usage on the
 * same ANTHROPIC_API_KEY) rather than a separate search API/credential.
 * Only returns stories the model actually found via search — it's
 * instructed not to invent results, and every item must carry a real URL.
 */
export async function searchWebCandidates(
  region: Region,
  options: { country?: string; cutoffDays?: number } = {}
): Promise<Candidate[]> {
  const { country, cutoffDays = 35 } = options;
  const client = new Anthropic();

  const focus = country ? `${country} (${REGION_LABELS[region]})` : REGION_LABELS[region];

  const system = `You are a research assistant for "FIGHTER GROUP INTEL / NEWS UPDATE", an open-source military intelligence briefing. Use web search to find recent, reliable news about military/defence and military-technology developments for: ${focus}.

Focus on: new military developments and procurement, ongoing military tensions, fighter jets, transport aircraft, helicopters, air-to-air and air-to-ground weapons, surface-to-air missiles/systems, long-range weapons, rocket launchers, radar, stealth, unmanned aerial systems/vehicles, next-generation fighters and payloads, reconnaissance, space/orbital projects, indigenous defence programmes, and sea-to-air threats.

Rules:
- Only return stories from the last ${cutoffDays} days.
- Prefer reputable, established outlets (e.g. Reuters, AP, BBC, Jane's, Defense News, The War Zone, Naval News, Breaking Defense, Associated Press, national broadsheets) over unverified blogs or aggregators.
- Every result MUST be a real article you found via search — never invent a title, outlet, or URL. If search finds fewer than 6 solid results, return fewer.
- Prefer distinct stories over near-duplicates of the same event from the same outlet.`;

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 4 }],
    output_config: { effort: "medium", format: zodOutputFormat(WebCandidatesSchema) },
    system,
    messages: [
      {
        role: "user",
        content: `Search for recent, reliable military/defence news about ${focus} and return the structured list.`,
      },
    ],
  });

  const parsed = response.parsed_output;
  if (!parsed) return [];

  return parsed.candidates
    .filter((c) => {
      try {
        new URL(c.url);
        return true;
      } catch {
        return false;
      }
    })
    .map((c) => ({
      title: c.title,
      link: c.url,
      sourceName: c.sourceName,
      sourceUrl: new URL(c.url).origin,
      contentSnippet: c.summary,
    }));
}
