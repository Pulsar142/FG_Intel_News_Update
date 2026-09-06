import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Candidate } from "@/lib/fetchCandidates";
import { fetchArticleText } from "@/lib/fetchArticleText";
import { verifyImageUrl } from "@/lib/verifyImage";
import { slugify } from "@/lib/slug";
import type { Region } from "@/generated/prisma/client";
import { REGION_LABELS } from "@/lib/sources";
import type { ArticleInput } from "@/lib/types";

const MODEL = "claude-sonnet-5";

const ArticleGenSchema = z.object({
  title: z.string().describe("A punchy, specific headline for the briefing, matching the house style."),
  summaryP1: z.string().describe("First in-depth summary paragraph, grounded strictly in the provided source text."),
  summaryP2: z.string().describe("Second in-depth summary paragraph, continuing the analysis/context."),
  didYouKnow: z.string().describe("One 'Did You Know?' paragraph with an interesting, factual detail related to the story."),
  perspective: z.string().describe(
    "The house 'perspective' section: one analytical paragraph (or, for multi-national stories, multiple short named-perspective paragraphs separated by a blank line) written from a military analyst's point of view."
  ),
  bullets: z
    .array(z.string())
    .min(3)
    .max(5)
    .describe("3-5 short bullet points summarising the article, for a 'quick brief' popup."),
});

export type ArticleGeneration = z.infer<typeof ArticleGenSchema>;

function perspectiveInstruction(region: Region): string {
  switch (region) {
    case "SINGAPORE":
      return "Write the perspective section as \"How it affects the RSAF\" — one paragraph of military-analyst commentary on the operational or strategic implications for the Republic of Singapore Air Force / SAF.";
    case "SEA":
    case "MALAYSIA":
    case "INDONESIA":
      return "Write the perspective section starting with a line like \"How this affects SEA and the SAF:\" — one paragraph of military-analyst commentary on the regional implications and what it means for Singapore's SAF.";
    default:
      return "Write the perspective section as \"Singapore's Perspective:\" — one paragraph of military-analyst commentary on how this affects Singapore, the RSAF/SAF, or Singapore's strategic interests. For a story with multiple clearly distinct national actors (e.g. a multi-country conflict or operation), you may instead write one short paragraph per actor labelled \"<Country>'s Perspective:\", each separated by a blank line, ending with a \"Singapore's Perspective:\" paragraph.";
  }
}

export async function generateArticleDraft(params: {
  region: Region;
  country?: string;
  candidate: Candidate;
  corroboratingSources: { name: string; url: string }[];
  weekOf: Date;
}): Promise<ArticleInput> {
  const { region, country, candidate, corroboratingSources, weekOf } = params;

  const fetched = await fetchArticleText(candidate.link);
  const groundingText =
    fetched?.text && fetched.text.length > 200 ? fetched.text : candidate.contentSnippet ?? candidate.title;

  const client = new Anthropic();

  const system = `You are the editorial desk for "FIGHTER GROUP INTEL / NEWS UPDATE", an open-source military intelligence briefing covering defence and military-technology developments (procurement, tensions, aircraft, weapons, air defence, radar, stealth, UAS/UAV, next-generation fighters, ISR, space, indigenous programmes, and sea-to-air threats) for Singapore, South-East Asia, the USA and the world.

House style, per article:
- An in-depth summary in exactly two paragraphs, grounded ONLY in the source text you are given. Do not invent facts, quotes, or figures not present in the source text.
- One "Did You Know?" paragraph with a genuinely interesting, verifiable detail related to the story (drawn from the source text, or well-established general knowledge about the equipment/topic named in it — never invented specifics).
- One perspective section, written like a professional military intelligence analyst: measured, non-sensational, specific about operational/strategic implications. ${perspectiveInstruction(region)}
- 3-5 short bullet points capturing the key facts, for a "quick brief" popup.
- A punchy, specific headline (not clickbait).

Region for this article: ${REGION_LABELS[region]}${country ? ` (${country})` : ""}.`;

  const user = `Source headline: ${candidate.title}
Source outlet: ${candidate.sourceName}
Source URL: ${candidate.link}
${corroboratingSources.length > 0 ? `Corroborating outlets: ${corroboratingSources.map((s) => s.name).join(", ")}\n` : ""}
Source article text (may be partial/truncated):
"""
${groundingText}
"""

Write the FIGHTER GROUP INTEL briefing article for this story, following the house style exactly.`;

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    output_config: { effort: "high", format: zodOutputFormat(ArticleGenSchema) },
    system,
    messages: [{ role: "user", content: user }],
  });

  const gen = response.parsed_output;
  if (!gen) {
    throw new Error(
      `Article generation failed to produce structured output (stop_reason=${response.stop_reason}).`
    );
  }

  const siteOrigin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
  const imageUrl =
    fetched?.ogImage && (await verifyImageUrl(fetched.ogImage, siteOrigin))
      ? fetched.ogImage
      : "/placeholder-briefing.svg";

  const sources = [
    { name: candidate.sourceName, url: candidate.link },
    ...corroboratingSources,
  ];

  return {
    slug: `${slugify(gen.title)}-${weekOf.toISOString().slice(0, 10)}`,
    title: gen.title,
    region,
    country,
    summaryP1: gen.summaryP1,
    summaryP2: gen.summaryP2,
    didYouKnow: gen.didYouKnow,
    perspective: gen.perspective,
    bullets: gen.bullets,
    images: [
      {
        url: imageUrl,
        caption: `Image from the original source article.`,
        sourceUrl: candidate.link,
      },
    ],
    sources,
    reliabilityScore: 1 + corroboratingSources.length,
    weekOf,
  };
}
