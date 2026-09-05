"use client";

import { useActionState } from "react";
import { editArticleAction } from "@/app/actions/admin";

export function EditForm({
  articleId,
  title,
  summaryP1,
  summaryP2,
  didYouKnow,
  perspective,
  bullets,
}: {
  articleId: string;
  title: string;
  summaryP1: string;
  summaryP2: string;
  didYouKnow: string;
  perspective: string;
  bullets: string[];
}) {
  const [state, formAction, pending] = useActionState(editArticleAction, undefined);

  const field = "rounded border border-border bg-panel-2 px-3 py-2 text-foreground outline-none focus:border-accent";
  const label = "font-mono text-xs uppercase tracking-widest text-muted";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="articleId" value={articleId} />

      <label className="flex flex-col gap-2">
        <span className={label}>Title</span>
        <input name="title" defaultValue={title} className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className={label}>Summary — paragraph 1</span>
        <textarea name="summaryP1" defaultValue={summaryP1} rows={4} className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className={label}>Summary — paragraph 2</span>
        <textarea name="summaryP2" defaultValue={summaryP2} rows={4} className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className={label}>Did You Know?</span>
        <textarea name="didYouKnow" defaultValue={didYouKnow} rows={3} className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className={label}>Perspective</span>
        <textarea name="perspective" defaultValue={perspective} rows={5} className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className={label}>Quick Brief bullets (one per line, 3-5)</span>
        <textarea
          name="bullets"
          defaultValue={bullets.join("\n")}
          rows={5}
          className={field}
        />
      </label>

      {state?.error && <p className="font-mono text-sm text-danger">{state.error}</p>}
      {state?.ok && <p className="font-mono text-sm text-accent-strong">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="stencil self-start rounded bg-accent px-5 py-2 text-sm font-semibold tracking-widest text-background hover:bg-accent-strong transition-colors disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
