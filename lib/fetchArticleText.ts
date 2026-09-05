import "server-only";

export type FetchedArticle = {
  text: string;
  ogImage: string | null;
};

/**
 * Best-effort plain-text extraction of an article page, for grounding the
 * generation prompt. Many news sites block bots or return paywalled shells —
 * callers should treat a short/empty result as "fall back to the RSS
 * snippet", not as a hard failure.
 */
export async function fetchArticleText(url: string): Promise<FetchedArticle | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; FighterGroupIntelBot/1.0; +https://example.com/bot)",
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    const ogImageMatch = html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
    );
    const ogImage = ogImageMatch ? ogImageMatch[1] : null;

    const withoutScripts = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ");
    const text = withoutScripts
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&#\d+;/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);

    return { text, ogImage };
  } catch {
    return null;
  }
}
