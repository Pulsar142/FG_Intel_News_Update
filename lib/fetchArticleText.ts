import "server-only";

export type FetchedArticle = {
  text: string;
  ogImage: string | null;
};

/**
 * Finds every `<meta>` tag and reads property/content in whichever order
 * they're written (`property` before `content`, or the reverse — both are
 * common across CMS templates), preferring og:image, then twitter:image.
 * Resolves protocol-relative and relative URLs against the page's own URL.
 */
function extractImageMeta(html: string, pageUrl: string): string | null {
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const attrsOf = (tag: string) => {
    const attrs: Record<string, string> = {};
    for (const m of tag.matchAll(/([a-zA-Z-]+)\s*=\s*["']([^"']*)["']/g)) {
      attrs[m[1].toLowerCase()] = m[2];
    }
    return attrs;
  };

  const byKey = (key: "property" | "name", ...values: string[]) => {
    for (const tag of metaTags) {
      const attrs = attrsOf(tag);
      const attrValue = attrs[key]?.toLowerCase();
      if (attrValue && values.includes(attrValue) && attrs.content) {
        return attrs.content;
      }
    }
    return null;
  };

  const raw =
    byKey("property", "og:image", "og:image:secure_url") ??
    byKey("name", "twitter:image", "twitter:image:src");
  if (!raw) return null;

  try {
    return new URL(raw, pageUrl).toString();
  } catch {
    return null;
  }
}

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
    const ogImage = extractImageMeta(html, url);

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
