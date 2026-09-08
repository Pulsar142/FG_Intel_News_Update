import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const MODEL = "claude-sonnet-5";

export const FUN_FACT_TOPICS = [
  "fighter jets",
  "helicopters",
  "UAVs/UAS (drones)",
  "air-to-air missiles",
  "air-to-ground bombs",
  "surface-to-air missile threats",
  "ships",
  "submarines",
  "stealth technology",
  "radar capabilities",
  "emerging military capabilities",
];

const FunFactSchema = z.object({
  fact: z.string().nullable().describe(
    "One genuinely interesting, surprising, verifiable one-to-two sentence military fact — null if you couldn't confirm one against a reliable source."
  ),
  sourceName: z.string().nullable().describe("The outlet/publication/manufacturer/government source backing this fact."),
  sourceUrl: z.string().nullable().describe("Direct URL to the source, exactly as found via search."),
});

/**
 * Generates one search-verified "fun fact" about a military topic — the
 * paid-pipeline counterpart to the free-generation Routine's own research.
 * Never fabricates: if search can't confirm anything solid, `fact` comes
 * back null and the caller should treat this as a failure, not insert a
 * guessed fact.
 */
export async function generateFunFact(topic?: string): Promise<{
  text: string;
  topic: string;
  sourceName: string | null;
  sourceUrl: string | null;
} | null> {
  const focus = topic?.trim() || FUN_FACT_TOPICS[Math.floor(Math.random() * FUN_FACT_TOPICS.length)];
  const client = new Anthropic();

  const system = `You are the editorial desk for "FIGHTER GROUP INTEL / NEWS UPDATE", an open-source military intelligence briefing. Use web search to find and confirm ONE genuinely interesting, surprising, verifiable military fact about: ${focus}.

Rules:
- The fact must be checkable against a reliable source: an established defence/military publication (Jane's, Defense News, The War Zone, Naval News, Breaking Defense, etc.), an official military/government source, a manufacturer's own published specifications, or a reputable general reference — never a random blog or unverifiable claim.
- Keep it to one or two sentences, punchy and specific (real numbers, dates, specs, records — not vague generalities).
- Never invent or guess a fact. If you search and can't confirm anything solid and specific for this topic, return null for "fact" rather than making something up.
- This is a general "fun fact," not tied to a specific breaking news story — historical, technical, or record-setting details about the topic are all fair game as long as they're accurate.`;

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 1500,
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 3 }],
    output_config: { effort: "medium", format: zodOutputFormat(FunFactSchema) },
    system,
    messages: [
      { role: "user", content: `Find and confirm one military fun fact about: ${focus}` },
    ],
  });

  const parsed = response.parsed_output;
  if (!parsed || !parsed.fact) return null;

  return {
    text: parsed.fact,
    topic: focus,
    sourceName: parsed.sourceName,
    sourceUrl: parsed.sourceUrl,
  };
}
