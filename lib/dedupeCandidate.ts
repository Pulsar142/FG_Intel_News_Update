import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Candidate } from "@/lib/fetchCandidates";

const MODEL = "claude-sonnet-5";

const DedupeSchema = z.object({
  freshIndex: z
    .number()
    .int()
    .nullable()
    .describe(
      "The 0-based index of the first candidate that covers a genuinely new development not already substantially covered by any of the existing titles — even if that earlier coverage used different wording or reported an earlier stage of the same ongoing story. Null if every candidate is a continuation/duplicate of something already covered."
    ),
  reason: z.string().describe("One short sentence explaining the pick, or why every candidate was a duplicate."),
});

/**
 * Screens a shortlist of candidate stories against titles already
 * drafted/published/archived, so the same underlying story doesn't get
 * written up twice — including a later stage of an ongoing saga reported
 * under a different headline (e.g. "Contract Slips Past Deadline",
 * "Decision Stalls", and "Pentagon Picks Winner" about the same programme
 * are the same story). Returns the first genuinely fresh candidate, or
 * null if the whole shortlist is already covered.
 */
export async function selectFreshCandidate(
  candidates: Candidate[],
  existingTitles: string[]
): Promise<Candidate | null> {
  if (candidates.length === 0) return null;
  if (existingTitles.length === 0) return candidates[0];

  const client = new Anthropic();

  const system = `You are a news editor checking a shortlist of candidate stories against titles already published, drafted, or archived on this site — to avoid running the same story twice. Watch specifically for a later development of the same ongoing saga reported under a different headline (procurement/contract sagas, ongoing conflicts, recurring diplomatic talks, etc. are especially prone to this) — that still counts as a duplicate, not a fresh story, unless it's a genuinely new discrete event.`;

  const user = `Already-covered titles (most recent first):
${existingTitles.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Candidate stories to choose from (most recent first):
${candidates.map((c, i) => `[${i}] ${c.title}${c.contentSnippet ? ` — ${c.contentSnippet.slice(0, 200)}` : ""}`).join("\n")}

Return the index of the first candidate that is a genuinely new, not-yet-covered story or discrete development, or null if every one is substantially a repeat/continuation of something already covered.`;

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 500,
    output_config: { effort: "medium", format: zodOutputFormat(DedupeSchema) },
    system,
    messages: [{ role: "user", content: user }],
  });

  const result = response.parsed_output;
  if (!result || result.freshIndex === null || result.freshIndex < 0 || result.freshIndex >= candidates.length) {
    return null;
  }
  return candidates[result.freshIndex];
}
