"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { generateDraftForRegion } from "@/lib/weeklyRun";
import { publishArticle } from "@/lib/publish";
import type { Region } from "@/generated/prisma/client";
import { nanoid } from "nanoid";

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
  await db.article.update({ where: { id: articleId }, data: { status: "ARCHIVED" } });
  revalidatePath("/admin/published");
  revalidatePath("/");
}

/** Permanently removes an article (any status) — unlike Archive, this can't be undone. */
export async function deleteArticleAction(formData: FormData) {
  await requireAdmin();
  const articleId = String(formData.get("articleId"));
  await db.article.delete({ where: { id: articleId } });
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

  await db.article.update({
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
  revalidatePath("/admin/pending");
  revalidatePath("/admin/published");
  return { ok: true };
}
