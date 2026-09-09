import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { verifyImageUrl } from "@/lib/verifyImage";
import { slugify } from "@/lib/slug";
import type { AviationSafetyRegion } from "@/generated/prisma/client";
import type { ArticleImage, ArticleSource } from "@/lib/types";

const MODEL = "claude-sonnet-5";

export const AVIATION_SAFETY_TOPICS = [
  "commercial aviation safety",
  "military aviation safety",
  "close-proximity / near-miss events between aircraft",
  "aviation weather-related incidents",
  "aviation crashes/accidents",
  "airworthiness issues",
  "G-LOC (G-induced loss of consciousness)",
  "aviation system or component malfunctions",
  "airborne emergencies",
  "safety ejections",
  "airspace constraint or infringement incidents",
];

const AviationSafetyGenSchema = z.object({
  found: z.boolean().describe("false if you couldn't confirm a real, verifiable incident matching scope"),
  title: z.string().nullable().describe("A specific, factual headline — never sensationalized."),
  incidentCategory: z
    .string()
    .nullable()
    .describe(
      "Which topic this incident falls under, e.g. 'close proximity / near-miss', 'CFIT', 'G-LOC', 'airspace infringement', 'in-flight structural failure', 'weather-related accident'."
    ),
  incidentDate: z.string().nullable().describe("ISO date (YYYY-MM-DD) the incident actually occurred, or null if unknown."),
  aircraftInfo: z.string().nullable().describe("Aircraft type and operator involved, if applicable/known."),
  summaryP1: z.string().nullable().describe("First summary paragraph: what happened, grounded strictly in the source reporting."),
  summaryP2: z.string().nullable().describe("Second summary paragraph: sequence of events / immediate response."),
  summaryP3: z.string().nullable().describe("Third summary paragraph: outcome, investigation status, or wider context."),
  safetyAnalysis: z
    .string()
    .nullable()
    .describe(
      "The 'Safety Analysis' section: a 5-Why root-cause chain (label each step 'Why 1:' through 'Why 5:') followed by a fishbone/Ishikawa cause-and-effect breakdown across Man, Machine, Method, Material, Environment, and Management categories (only list categories with a real, grounded contributing factor — do not force all six). Every claim must be grounded in the reported facts or well-established aviation safety analysis practice — never invented specifics."
    ),
  preventativeMeasures: z
    .string()
    .nullable()
    .describe("Concrete, actionable preventative measures aviation personnel could apply, grounded in the root causes identified above."),
  hfacsAnalysis: z
    .string()
    .nullable()
    .describe(
      "HFACS (Human Factors Analysis and Classification System) categorisation of human-error contributing factors, organized by HFACS level (Unsafe Acts; Preconditions for Unsafe Acts; Unsafe Supervision; Organizational Influences) with the specific applicable subcategories named. Set this to null (not a guess) if human error is not a genuine, reported contributing factor for this event — e.g. a pure mechanical failure or weather event with no crew/ATC/maintenance factor."
    ),
  imageCandidates: z
    .array(
      z.object({
        url: z.string().describe("Direct URL to an actual image file (jpg/png/webp) related to this incident."),
        sourceName: z.string().describe("Outlet or archive credited for the photo."),
        sourceUrl: z.string().describe("The page the photo was found on."),
      })
    )
    .describe("2-4 candidate direct image URLs, most likely to resolve first. Only real URLs actually returned by search/fetch."),
  sources: z
    .array(z.object({ name: z.string(), url: z.string() }))
    .describe("Every outlet/authority used, primary source first."),
  corroboratingSourceCount: z
    .number()
    .int()
    .min(0)
    .describe("How many independent outlets/authorities corroborate this beyond the primary source."),
});

function regionScopeInstruction(region: AviationSafetyRegion, country?: string): string {
  switch (region) {
    case "ASIA":
      return "Scope: find an incident that occurred in Asia (South, East, or Southeast Asia), or one involving an Asia-based operator/airline/air force.";
    case "GLOBAL":
      return "Scope: find an incident that occurred OUTSIDE Asia (to keep this distinct from the Asia-scoped briefing) — anywhere else in the world.";
    case "CUSTOM":
      return `Scope: find an incident specific to ${country ?? "the requested country"} — occurring there, or involving that country's operators/airlines/air force.`;
  }
}

/**
 * Finds and writes one grounded, ICAO SMS-scoped aviation safety incident
 * briefing for aviation personnel — never fabricates: if search can't confirm
 * a real, verifiable incident, this returns null and the caller should treat
 * it as a failure, not insert a guessed article.
 */
export async function generateAviationSafetyArticle(params: {
  region: AviationSafetyRegion;
  country?: string;
}): Promise<{
  title: string;
  incidentCategory: string;
  incidentDate: Date | null;
  aircraftInfo: string | null;
  summaryP1: string;
  summaryP2: string;
  summaryP3: string;
  safetyAnalysis: string;
  preventativeMeasures: string;
  hfacsAnalysis: string | null;
  images: ArticleImage[];
  sources: ArticleSource[];
  reliabilityScore: number;
} | null> {
  const { region, country } = params;
  const client = new Anthropic();

  const system = `You are, at once, a military research analyst, an aviation safety analyst and accident investigator, and a safety advocate, writing for "FIGHTER GROUP INTEL / NEWS UPDATE"'s "Aviation Safety" section — content directed at aviation personnel (aircrew, maintainers, ATC, safety officers).

Scope your work using ICAO Safety Management System (SMS) doctrine (Annex 19): the goal of every briefing is safety risk management and safety promotion — identifying hazards and contributing factors from a real event, and turning them into concrete, actionable lessons, never sensationalism or blame.

Topics in scope: ${AVIATION_SAFETY_TOPICS.join("; ")}.

${regionScopeInstruction(region, country)}

Rules:
- The incident must be real and verifiable against a reliable, established source: an official accident/incident investigation authority (NTSB, AAIB, ATSB, TSB Canada, JTSB, BEA, ICAO, a national CAA), or established aviation-safety journalism (Aviation Safety Network/ASN, The Aviation Herald, FlightGlobal, Aviation Week, AVweb) — never an unverified blog, forum, or social-media claim. It can be a recent event or a notable historical one if it is genuinely instructive, but never invented.
- Never fabricate facts, quotes, figures, dates, or causes. Every claim in the summary, Safety Analysis, Preventative Measures, and HFACS sections must be grounded in what the source(s) actually reported or in well-established aviation safety analysis practice — if the reporting doesn't support a specific root cause, say so rather than inventing one.
- Write the three summary paragraphs in a measured, factual, non-sensational tone.
- For image candidates: only list URLs actually returned by search/fetch — never invented. Prefer official investigation-authority photos, established aviation-press photos, or aircraft/incident photos from reputable aviation archives.
- If you cannot confirm a real incident meeting scope, or cannot ground the required analysis in real reporting, set found to false rather than fabricating.`;

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 6 }],
    output_config: { effort: "high", format: zodOutputFormat(AviationSafetyGenSchema) },
    system,
    messages: [
      {
        role: "user",
        content: "Find, verify, and write one Aviation Safety briefing meeting the scope and rules above.",
      },
    ],
  });

  const gen = response.parsed_output;
  if (
    !gen ||
    !gen.found ||
    !gen.title ||
    !gen.incidentCategory ||
    !gen.summaryP1 ||
    !gen.summaryP2 ||
    !gen.summaryP3 ||
    !gen.safetyAnalysis ||
    !gen.preventativeMeasures
  ) {
    return null;
  }

  let imageUrl = "/placeholder-briefing.svg";
  let imageSourceUrl = "";
  for (const candidate of gen.imageCandidates) {
    if (await verifyImageUrl(candidate.url)) {
      imageUrl = candidate.url;
      imageSourceUrl = candidate.sourceUrl;
      break;
    }
  }

  return {
    title: gen.title,
    incidentCategory: gen.incidentCategory,
    incidentDate: gen.incidentDate ? new Date(`${gen.incidentDate}T00:00:00.000Z`) : null,
    aircraftInfo: gen.aircraftInfo,
    summaryP1: gen.summaryP1,
    summaryP2: gen.summaryP2,
    summaryP3: gen.summaryP3,
    safetyAnalysis: gen.safetyAnalysis,
    preventativeMeasures: gen.preventativeMeasures,
    hfacsAnalysis: gen.hfacsAnalysis,
    images: [{ url: imageUrl, caption: "Image related to this incident.", sourceUrl: imageSourceUrl }],
    sources: gen.sources,
    reliabilityScore: 1 + gen.corroboratingSourceCount,
  };
}

export function aviationSlug(title: string, weekOf: Date): string {
  return `${slugify(title)}-${weekOf.toISOString().slice(0, 10)}`;
}
