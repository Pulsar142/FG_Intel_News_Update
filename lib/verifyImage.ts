import "server-only";

/** Width/height for PNG (IHDR is always the first chunk, at a fixed offset) and JPEG (scans for the SOFn marker). Returns null for formats/cases it can't parse — callers should treat that as "unknown", not "bad". */
function readDimensions(bytes: Uint8Array, contentType: string): { width: number; height: number } | null {
  if (contentType.includes("png") && bytes.length >= 24) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }
  if (contentType.includes("jpeg") || contentType.includes("jpg")) {
    let i = 2;
    while (i + 9 < bytes.length) {
      if (bytes[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = bytes[i + 1];
      const isSOF = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isSOF) {
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        return { height: view.getUint16(i + 5), width: view.getUint16(i + 7) };
      }
      const segmentLength = (bytes[i + 2] << 8) | bytes[i + 3];
      i += 2 + segmentLength;
    }
  }
  return null;
}

/**
 * Confirms an image URL actually serves a real, usable hero photo when
 * embedded cross-origin the way the public site will load it — not just
 * that the URL responds. Two failure modes this catches that a bare
 * fetch/status check would miss:
 * - Hotlink protection that 403s once the Referer header is a foreign
 *   origin (fine for a same-origin curl check, broken in the browser).
 * - A dead image path that resolves to a generic small fallback/logo
 *   graphic with a 200 status instead of the real article photo.
 */
export async function verifyImageUrl(url: string, siteOrigin?: string): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,*/*;q=0.8",
      "Sec-Fetch-Dest": "image",
      "Sec-Fetch-Mode": "no-cors",
      "Sec-Fetch-Site": "cross-site",
    };
    if (siteOrigin) headers.Referer = siteOrigin;

    const res = await fetch(url, { headers, signal: AbortSignal.timeout(8_000) });
    if (!res.ok) return false;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return false;

    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.length < 1500) return false; // smaller than any real hero photo

    const dims = readDimensions(buf, contentType);
    if (dims && dims.width > 0 && dims.height > 0) {
      // Real hero/og images run at least a few hundred px; a tiny square is
      // the shape of a generic fallback/logo graphic, not article art.
      if (dims.width < 400 || dims.height < 250) return false;
    }

    return true;
  } catch {
    return false;
  }
}
