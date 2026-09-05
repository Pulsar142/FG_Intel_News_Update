import "server-only";
import type { Candidate } from "@/lib/fetchCandidates";

const STOPWORDS = new Set([
  "the", "a", "an", "of", "in", "on", "for", "to", "and", "or", "with", "is", "are",
  "at", "by", "from", "as", "its", "it's", "new", "how", "why", "what", "will",
]);

function significantWords(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w))
  );
}

function similarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let overlap = 0;
  for (const w of a) if (b.has(w)) overlap++;
  return overlap / Math.min(a.size, b.size);
}

export type CrossCheckResult = {
  reliabilityScore: number;
  corroboratingSources: { name: string; url: string }[];
};

/**
 * Scores a chosen candidate's reliability by looking for topically similar
 * headlines from *different* sources among everything else fetched for the
 * region. Score = 1 (the chosen source itself) + number of distinct
 * corroborating sources found.
 */
export function crossCheck(chosen: Candidate, allCandidates: Candidate[]): CrossCheckResult {
  const chosenWords = significantWords(chosen.title);
  const corroborating = new Map<string, { name: string; url: string }>();

  for (const other of allCandidates) {
    if (other.link === chosen.link) continue;
    if (other.sourceName === chosen.sourceName) continue;
    const otherWords = significantWords(other.title);
    if (similarity(chosenWords, otherWords) >= 0.4) {
      corroborating.set(other.sourceName, { name: other.sourceName, url: other.link });
    }
  }

  return {
    reliabilityScore: 1 + corroborating.size,
    corroboratingSources: [...corroborating.values()],
  };
}
