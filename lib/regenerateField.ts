import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Region } from "@/generated/prisma/client";
import { REGION_LABELS } from "@/lib/sources";

const MODEL = "claude-sonnet-5";

const FieldSchema = z.object({
  text: z.string().describe("The rewritten paragraph(s), matching the house style exactly."),
});

export type RegenerableField = "didYouKnow" | "strategicRelevance" | "militaryPerspective";

/**
 * Rewrites a single "Did You Know?" or "Perspective" section in response to
 * an admin's own question/instruction — e.g. "did any other country
 * respond?" or "focus more on the cost angle" — while keeping the section
 * grounded in the article's own summary (never inventing new facts beyond
 * what's already there or well-established general knowledge).
 */
export async function regenerateArticleField(params: {
  field: RegenerableField;
  question: string;
  region: Region;
  country?: string;
  title: string;
  summaryP1: string;
  summaryP2: string;
  currentText: string;
}): Promise<string> {
  const { field, question, region, country, title, summaryP1, summaryP2, currentText } = params;
  const client = new Anthropic();

  const fieldLabel =
    field === "didYouKnow"
      ? `"Did You Know?"`
      : field === "strategicRelevance"
        ? `"Strategic Relevance in South East Asia"`
        : `"Military Perspective in South East Asia"`;
  const styleNote =
    field === "didYouKnow"
      ? "A meaty passage (2-4 sentences) going well beyond a single surface fact — include specific technical details, specs/numbers, historical context, or a comparison that deepens the reader's understanding. Never invent specifics not grounded in the article's summary below or well-established general knowledge about the equipment/topic it names."
      : field === "strategicRelevance"
        ? "One analytical paragraph, written by a senior military strategist, on why this development matters to the South East Asian security environment and balance of power — regional alliances/partnerships, great-power competition, sea lanes and chokepoints, technology or doctrine diffusion, or precedent it sets for the region — even when the underlying story is not itself set in South East Asia."
        : "One analytical paragraph, written by a senior military analyst, on the operational/capability implications for South East Asian armed forces generally — doctrine, capability gaps, deterrence posture, procurement priorities, or interoperability — not narrowed to any single country's military unless the story is genuinely about that country specifically.";

  const system = `You are the editorial desk for "FIGHTER GROUP INTEL / NEWS UPDATE", an open-source military intelligence briefing. An admin reviewing this article wants the ${fieldLabel} section rewritten to address a specific question or instruction of theirs.

Article title: ${title}
Region: ${REGION_LABELS[region]}${country ? ` (${country})` : ""}

Article summary (the only factual grounding you have — do not invent facts beyond this or well-established general knowledge about the topic named in it):
${summaryP1}
${summaryP2}

Current ${fieldLabel} text:
${currentText}

House style for this section: ${styleNote}`;

  const user = `Admin's question/instruction: ${question}

Rewrite the ${fieldLabel} section to address this. If the summary above doesn't contain enough grounded information to fully answer it, answer as much as is genuinely supportable and say so plainly rather than fabricating specifics.`;

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 1200,
    output_config: { effort: "medium", format: zodOutputFormat(FieldSchema) },
    system,
    messages: [{ role: "user", content: user }],
  });

  const result = response.parsed_output;
  if (!result) {
    throw new Error(`Regeneration failed to produce output (stop_reason=${response.stop_reason}).`);
  }
  return result.text;
}
