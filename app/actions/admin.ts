"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { generateDraftForRegion } from "@/lib/weeklyRun";
import { publishArticle, refreshDigest } from "@/lib/publish";
import { verifyImageUrl } from "@/lib/verifyImage";
import { regenerateArticleField, type RegenerableField } from "@/lib/regenerateField";
import type { Region } from "@/generated/prisma/client";
import type { ArticleImage } from "@/lib/types";
import { nanoid } from "nanoid";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

async function requireAdmin() {
  const session = await getSession();
  if (session?.role !== "admin") throw new Error("Not authorized.");
}

export type AdminActionState = { error?: string; ok?: boolean } | undefined;

export async function generateAction(
  _state: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const region = String(formData.get("region") ?? "") as Region;
  const country = String(formData.get("country") ?? "").trim() || undefined;

  try {
    await generateDraftForRegion(region, { country });
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  revalidatePath("/admin/pending");
  return { ok: true };
}

/**
 * The "free workflow" path: queues a request instead of calling the
 * Anthropic API. Picked up within about an hour by the free-generation
 * Routine (a Claude Code session doing the research/writing on its own
 * model access, no API credits spent), which creates the draft article and
 * marks this request fulfilled.
 */
export async function requestFreeGenerationAction(
  _state: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const region = String(formData.get("region") ?? "") as Region;
  const country = String(formData.get("country") ?? "").trim() || undefined;

  await db.generationRequest.create({ data: { region, country } });
  revalidatePath("/admin/generate");
  return { ok: true };
}

export async function cancelFreeGenerationRequestAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await db.generationRequest.delete({ where: { id } });
  revalidatePath("/admin/generate");
}

/** Instant (paid) regenerate — replaces a draft via the Anthropic API. Requires a funded ANTHROPIC_API_KEY. */
export async function regenerateAction(
  _state: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const articleId = String(formData.get("articleId"));
  const article = await db.article.findUniqueOrThrow({ where: { id: articleId } });

  try {
    await generateDraftForRegion(article.region, {
      country: article.country ?? undefined,
      weekOf: article.weekOf,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  await db.article.delete({ where: { id: articleId } });
  revalidatePath("/admin/pending");
  return { ok: true };
}

export async function publishAction(formData: FormData) {
  await requireAdmin();
  const articleId = String(formData.get("articleId"));
  await publishArticle(articleId);
  revalidatePath("/admin/pending");
  revalidatePath("/admin/published");
  revalidatePath("/");
}

export async function discardDraftAction(formData: FormData) {
  await requireAdmin();
  const articleId = String(formData.get("articleId"));
  await db.article.delete({ where: { id: articleId } });
  revalidatePath("/admin/pending");
}

/** Lets an admin hide the Perspective section from the public article page without deleting the text — flip back any time. */
export async function toggleHidePerspectiveAction(formData: FormData) {
  await requireAdmin();
  const articleId = String(formData.get("articleId"));
  const article = await db.article.findUniqueOrThrow({ where: { id: articleId } });
  await db.article.update({
    where: { id: articleId },
    data: { perspectiveHidden: !article.perspectiveHidden },
  });
  revalidatePath("/admin/pending");
  revalidatePath("/admin/published");
  revalidatePath("/admin/archived");
  revalidatePath(`/admin/edit/${articleId}`);
  revalidatePath("/");
}

export async function archiveAction(formData: FormData) {
  await requireAdmin();
  const articleId = String(formData.get("articleId"));
  const article = await db.article.update({ where: { id: articleId }, data: { status: "ARCHIVED" } });
  await refreshDigest(article.weekOf);
  revalidatePath("/admin/published");
  revalidatePath("/");
}

/** Permanently removes an article (any status) — unlike Archive, this can't be undone. */
export async function deleteArticleAction(formData: FormData) {
  await requireAdmin();
  const articleId = String(formData.get("articleId"));
  const article = await db.article.delete({ where: { id: articleId } });
  await refreshDigest(article.weekOf);
  revalidatePath("/admin/pending");
  revalidatePath("/admin/published");
  revalidatePath("/admin/archived");
  revalidatePath("/");
}

export async function toggleRegionAction(formData: FormData) {
  await requireAdmin();
  const region = String(formData.get("region")) as Region;
  const enabled = formData.get("enabled") === "true";
  await db.regionSetting.upsert({
    where: { region },
    update: { enabled },
    create: { region, enabled },
  });
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function createInviteAction(formData: FormData) {
  await requireAdmin();
  const label = String(formData.get("label") ?? "").trim() || undefined;
  await db.accessInvite.create({ data: { token: nanoid(16), label } });
  revalidatePath("/admin/settings");
}

export async function revokeInviteAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await db.accessInvite.update({ where: { id }, data: { revoked: true } });
  revalidatePath("/admin/settings");
}

export async function editArticleAction(
  _state: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const articleId = String(formData.get("articleId"));
  const bullets = String(formData.get("bullets") ?? "")
    .split("\n")
    .map((b) => b.trim())
    .filter(Boolean);
  const articleDateRaw = String(formData.get("articleDate") ?? "").trim();
  const articleDate = articleDateRaw ? new Date(`${articleDateRaw}T00:00:00.000Z`) : null;
  const summaryP3Raw = String(formData.get("summaryP3") ?? "").trim();

  const article = await db.article.update({
    where: { id: articleId },
    data: {
      title: String(formData.get("title") ?? ""),
      summaryP1: String(formData.get("summaryP1") ?? ""),
      summaryP2: String(formData.get("summaryP2") ?? ""),
      summaryP3: summaryP3Raw || null,
      didYouKnow: String(formData.get("didYouKnow") ?? ""),
      perspective: String(formData.get("perspective") ?? ""),
      bullets: JSON.stringify(bullets),
      articleDate,
    },
  });
  await refreshDigest(article.weekOf);
  revalidatePath("/admin/pending");
  revalidatePath("/admin/published");
  return { ok: true };
}

/**
 * Lets an admin override an article's hero image directly — either
 * uploading a file they saved from the source link themselves, or pasting a
 * URL (verified before it's accepted). Covers cases where the auto-picked
 * image was never resolvable (hotlink-protected, dead link, or a generic
 * fallback graphic) or the admin just prefers a different shot.
 */
export type ImageActionState = { error?: string; ok?: boolean } | undefined;

export async function replaceArticleImageAction(
  _state: ImageActionState,
  formData: FormData
): Promise<ImageActionState> {
  await requireAdmin();
  const articleId = String(formData.get("articleId"));
  const caption = String(formData.get("caption") ?? "").trim();
  const pastedUrl = String(formData.get("imageUrl") ?? "").trim();
  const file = formData.get("image");

  const article = await db.article.findUniqueOrThrow({ where: { id: articleId } });
  const existing = JSON.parse(article.images) as ArticleImage[];
  const existingSourceUrl = existing[0]?.sourceUrl ?? "";

  let url: string;
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_UPLOAD_BYTES) {
      return { error: `Image is too large — max ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB.` };
    }
    if (!file.type.startsWith("image/")) {
      return { error: "That file isn't an image." };
    }
    const buf = Buffer.from(await file.arrayBuffer());
    url = `data:${file.type};base64,${buf.toString("base64")}`;
  } else if (pastedUrl) {
    const ok = await verifyImageUrl(pastedUrl);
    if (!ok) {
      return {
        error:
          "That image URL didn't resolve to a real, usable image — try saving it from the article and uploading the file instead.",
      };
    }
    url = pastedUrl;
  } else {
    return { error: "Choose a file to upload, or paste an image URL." };
  }

  const images: ArticleImage[] = [
    { url, caption: caption || "Uploaded by admin.", sourceUrl: existingSourceUrl },
  ];
  await db.article.update({ where: { id: articleId }, data: { images: JSON.stringify(images) } });
  revalidatePath("/admin/pending");
  revalidatePath("/admin/published");
  revalidatePath("/admin/archived");
  revalidatePath(`/admin/edit/${articleId}`);
  revalidatePath("/");
  return { ok: true };
}

/**
 * Lets an admin pose a question or instruction ("did any other country
 * respond?", "focus more on cost") and have just the Did You Know or
 * Perspective section rewritten to address it — rather than only being able
 * to hand-edit the existing text.
 */
export type RegenerateFieldState = { error?: string; ok?: boolean } | undefined;

export async function regenerateFieldAction(
  _state: RegenerateFieldState,
  formData: FormData
): Promise<RegenerateFieldState> {
  await requireAdmin();
  const articleId = String(formData.get("articleId"));
  const field = String(formData.get("field")) as RegenerableField;
  const question = String(formData.get("question") ?? "").trim();
  if (!question) return { error: "Enter a question or instruction first." };

  const article = await db.article.findUniqueOrThrow({ where: { id: articleId } });

  let text: string;
  try {
    text = await regenerateArticleField({
      field,
      question,
      region: article.region,
      country: article.country ?? undefined,
      title: article.title,
      summaryP1: article.summaryP1,
      summaryP2: article.summaryP2,
      currentText: field === "didYouKnow" ? article.didYouKnow : article.perspective,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }

  await db.article.update({ where: { id: articleId }, data: { [field]: text } });
  revalidatePath("/admin/pending");
  revalidatePath("/admin/published");
  revalidatePath(`/admin/edit/${articleId}`);
  return { ok: true };
}

/**
 * The "free workflow" equivalent: queues the question/instruction instead of
 * calling the Anthropic API. Picked up by the same hourly free-generation
 * Routine, which rewrites the field itself and updates the Article directly.
 */
export async function requestFreeFieldRegenerationAction(
  _state: RegenerateFieldState,
  formData: FormData
): Promise<RegenerateFieldState> {
  await requireAdmin();
  const articleId = String(formData.get("articleId"));
  const field = String(formData.get("field")) as RegenerableField;
  const question = String(formData.get("question") ?? "").trim();
  if (!question) return { error: "Enter a question or instruction first." };

  await db.fieldRegenerationRequest.create({ data: { articleId, field, question } });
  revalidatePath(`/admin/edit/${articleId}`);
  return { ok: true };
}
