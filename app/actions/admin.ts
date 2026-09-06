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

export async function regenerateAction(formData: FormData) {
  await requireAdmin();
  const articleId = String(formData.get("articleId"));
  const article = await db.article.findUniqueOrThrow({ where: { id: articleId } });

  await generateDraftForRegion(article.region, {
    country: article.country ?? undefined,
    weekOf: article.weekOf,
  });
  await db.article.delete({ where: { id: articleId } });
  revalidatePath("/admin/pending");
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

  const article = await db.article.update({
    where: { id: articleId },
    data: {
      title: String(formData.get("title") ?? ""),
      summaryP1: String(formData.get("summaryP1") ?? ""),
      summaryP2: String(formData.get("summaryP2") ?? ""),
      didYouKnow: String(formData.get("didYouKnow") ?? ""),
      perspective: String(formData.get("perspective") ?? ""),
      bullets: JSON.stringify(bullets),
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
