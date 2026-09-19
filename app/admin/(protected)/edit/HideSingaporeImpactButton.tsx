"use client";

import { toggleHideSingaporeImpactAction } from "@/app/actions/admin";

export function HideSingaporeImpactButton({
  articleId,
  hidden,
}: {
  articleId: string;
  hidden: boolean;
}) {
  return (
    <form action={toggleHideSingaporeImpactAction}>
      <input type="hidden" name="articleId" value={articleId} />
      <button
        type="submit"
        className={
          hidden
            ? "rounded border border-border px-3 py-1.5 font-mono text-xs text-muted hover:border-accent hover:text-accent-strong transition-colors"
            : "rounded border border-accent px-3 py-1.5 font-mono text-xs text-accent-strong hover:bg-accent hover:text-background transition-colors"
        }
      >
        {hidden ? "Impact towards Singapore hidden — Show it" : "Hide Impact towards Singapore from public page"}
      </button>
    </form>
  );
}
