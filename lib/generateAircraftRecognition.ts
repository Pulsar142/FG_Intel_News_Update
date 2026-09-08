import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { verifyImageUrl } from "@/lib/verifyImage";

const MODEL = "claude-sonnet-5";

export const AIRCRAFT_CATEGORIES = ["FIGHTER_JET", "HELICOPTER", "UAV", "COMMERCIAL_AIRLINER"] as const;
export type AircraftCategoryValue = (typeof AIRCRAFT_CATEGORIES)[number];

const CATEGORY_LABELS: Record<AircraftCategoryValue, string> = {
  FIGHTER_JET: "a military fighter jet",
  HELICOPTER: "a military helicopter",
  UAV: "a military UAV/UAS (drone)",
  COMMERCIAL_AIRLINER: "a commercial airliner",
};

const AircraftRecognitionSchema = z.object({
  found: z.boolean().describe("false if you couldn't confirm a real aircraft + a real, working photo of it"),
  aircraftName: z
    .string()
    .nullable()
    .describe('Full identification, e.g. "Lockheed Martin F-16C Fighting Falcon" — null if not found.'),
  category: z
    .enum(AIRCRAFT_CATEGORIES)
    .nullable()
    .describe("Which of the four categories this aircraft actually is."),
  operator: z
    .string()
    .nullable()
    .describe('Operating air force / airline / country, e.g. "Republic of Singapore Air Force" — null if unknown.'),
  description: z
    .string()
    .nullable()
    .describe(
      "A one-to-two sentence description: identify the aircraft and name its most characteristic, distinguishing visual feature (e.g. canard layout, twin tail fins, rotor configuration, engine count/placement) — the kind of detail that lets a viewer recognize it next time."
    ),
  imageCandidates: z
    .array(
      z.object({
        url: z.string().describe("Direct URL to an actual image file (jpg/png/webp) of this exact aircraft."),
        sourceName: z.string().describe("Outlet, photographer, manufacturer, or archive credited for the photo."),
        sourceUrl: z.string().describe("The page the photo was found on, for attribution/verification."),
      })
    )
    .describe(
      "2-4 candidate direct image URLs of this exact aircraft, most likely to actually resolve first. Only real URLs actually returned by search/fetch — never invented."
    ),
});

/**
 * Finds one real, verified photo of a military or commercial aircraft
 * operating in/around Asia, identifies it, and writes a 1-2 line
 * recognition description — the paid-pipeline counterpart to the
 * free-generation Routine's own research. Never fabricates: if search can't
 * confirm both a real aircraft AND a real, resolvable photo of it, this
 * returns null and the caller should treat it as a failure.
 */
export async function generateAircraftRecognition(topic?: string): Promise<{
  imageUrl: string;
  imageSourceName: string | null;
  imageSourceUrl: string | null;
  aircraftName: string;
  category: AircraftCategoryValue;
  operator: string | null;
  description: string;
} | null> {
  const focusTopic = topic?.trim();
  const focus =
    focusTopic || CATEGORY_LABELS[AIRCRAFT_CATEGORIES[Math.floor(Math.random() * AIRCRAFT_CATEGORIES.length)]];

  const client = new Anthropic();

  const system = `You are the editorial desk for "FIGHTER GROUP INTEL / NEWS UPDATE", an open-source military intelligence briefing, building an "Aircraft Recognition" trainer for military aircrew analysts.

Use web search to find ONE real, specific aircraft matching: ${focus}. It must be a fighter jet, military helicopter, military UAV/UAS, or commercial airliner that is operated in, or has been photographed in, the Asia region (Southeast Asia, East Asia, South Asia — e.g. Singapore, Malaysia, Indonesia, or wider Asia-Pacific air forces/airlines).

Rules:
- Never invent an aircraft, a specification, or an image URL. Only report what search/fetch actually returned.
- The identification must be a real, specific aircraft type and variant (not a vague "a jet fighter") that you can back with a reliable source: an established defence/aviation publication (Jane's, Flight Global, The War Zone, Aviation Week, etc.), an official military/government source, a manufacturer's own specifications, an airline's own fleet page, or a reputable aviation photography archive (e.g. Planespotters, JetPhotos, Wikimedia Commons).
- For each image candidate, the URL must be a direct link to an actual image file (ending in a real photo, not a webpage) that you found via search/fetch — list 2-4 candidates most likely to work, in order of confidence. If you truly can't find any real image URL for a real aircraft you identified, set found to false rather than guessing a URL.
- Write "description" as one to two sentences: identify the aircraft (name + variant) and call out its single most useful distinguishing visual feature for recognition purposes — something an aircrew analyst would look for (silhouette, wing/rotor/tail configuration, engine count and placement, canopy shape, distinctive markings type, etc.), grounded in the source material or well-established general knowledge about that aircraft type.
- If you cannot confirm both a real, specific aircraft AND at least one real image URL for it, set found to false and leave the other fields null — do not fabricate to fill them in.`;

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 2000,
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 5 }],
    output_config: { effort: "medium", format: zodOutputFormat(AircraftRecognitionSchema) },
    system,
    messages: [
      {
        role: "user",
        content: `Find, identify, and verify one real aircraft image for: ${focus} (Asia region relevance required).`,
      },
    ],
  });

  const parsed = response.parsed_output;
  if (!parsed || !parsed.found || !parsed.aircraftName || !parsed.category || !parsed.description) return null;

  for (const candidate of parsed.imageCandidates) {
    const ok = await verifyImageUrl(candidate.url);
    if (ok) {
      return {
        imageUrl: candidate.url,
        imageSourceName: candidate.sourceName ?? null,
        imageSourceUrl: candidate.sourceUrl ?? null,
        aircraftName: parsed.aircraftName,
        category: parsed.category,
        operator: parsed.operator,
        description: parsed.description,
      };
    }
  }

  return null;
}
