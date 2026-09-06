import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Candidate } from "@/lib/fetchCandidates";

const MODEL = "claude-sonnet-5";

const CorroborationSchema = z.object({
  sources: z
    .array(
      z.object({
        name: z.string().describe("The outlet's name, e.g. 'Reuters' or 'Naval News'."),
        url: z.string().describe("Direct URL to the article, exactly as returned by search."),
      })
    )
    .max(3),
});

/**
 * Targeted follow-up search for a chosen story: unlike the general
 * region-wide candidate search, this asks specifically for OTHER outlets
 * reporting the *same* story, so the article's source list isn't limited to
 * whatever the general candidate pool happened to also pick up.
 */
export async function findCorroboratingSources(
  candidate: Candidate,
  alreadyFound: { name: string; url: string }[]
): Promise<{ name: string; url: string }[]> {
  const client = new Anthropic();
  const excludeNames = new Set(
    [candidate.sourceName, ...alreadyFound.map((s) => s.name)].map((n) => n.toLowerCase())
  );

  const system = `You are a fact-checking research assistant for a military-intelligence news briefing. Given one specific news story, use web search to find OTHER, independent outlets that reported that SAME specific story (matching the key facts/entities/date) — not just related background coverage of the general topic, and not the outlet that already broke it.

Rules:
- Every result MUST be a real article you found via search — never invent a title, outlet, or URL.
- Do not return: ${candidate.sourceName}${alreadyFound.length ? `, ${alreadyFound.map((s) => s.name).join(", ")}` : ""}.
- If you can't find genuine independent corroborating coverage of this exact story, return an empty list rather than forcing a loose match.`;

  const user = `Story headline: ${candidate.title}
Already reported by: ${candidate.sourceName} (${candidate.link})

Find up to 3 other outlets independently reporting this same specific story.`;

  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 2000,
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 3 }],
      output_config: { effort: "low", format: zodOutputFormat(CorroborationSchema) },
      system,
      messages: [{ role: "user", content: user }],
    });

    const parsed = response.parsed_output;
    if (!parsed) return [];

    const results: { name: string; url: string }[] = [];
    for (const s of parsed.sources) {
      try {
        new URL(s.url);
      } catch {
        continue;
      }
      const key = s.name.toLowerCase();
      if (excludeNames.has(key)) continue;
      excludeNames.add(key);
      results.push(s);
    }
    return results;
  } catch {
    return [];
  }
}
