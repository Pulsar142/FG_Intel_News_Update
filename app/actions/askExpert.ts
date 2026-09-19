"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

const MIN_LENGTH = 8;
const MAX_LENGTH = 500;

export type AskExpertState = { error?: string; ok?: boolean; id?: string } | undefined;

async function requireViewer() {
  const session = await getSession();
  if (!session) throw new Error("Not authorized.");
}

/**
 * Public, viewer-facing action for the front-page "Ask the Expert" box.
 * Queues the question for the free-generation Routine to research and
 * answer within about an hour — there's no synchronous API call here, and
 * no admin review step before the answer reaches the asker (same "free
 * workflow, direct to viewer" treatment as Fun Facts/Aircraft Recognition).
 */
export async function submitExpertQuestionAction(
  _state: AskExpertState,
  formData: FormData
): Promise<AskExpertState> {
  await requireViewer();
  const question = String(formData.get("question") ?? "").trim();

  if (question.length < MIN_LENGTH) {
    return { error: "Ask a bit more — a few words won't give the analyst enough to research." };
  }
  if (question.length > MAX_LENGTH) {
    return { error: `Keep it under ${MAX_LENGTH} characters.` };
  }

  const created = await db.expertQuestion.create({ data: { question } });
  return { ok: true, id: created.id };
}
