"use client";

import { toggleHideAnalysisAction } from "@/app/actions/admin";

export function HideAnalysisButton({
  articleId,
  hidden,
}: {
  articleId: string;
  hidden: boolean;
}) {
  return (
    <form action={toggleHideAnalysisAction}>
      <input type="hidden" name="articleId" value={articleId} />
      <button
        type="submit"
        className={
          hidden
            ? "rounded border border-danger px-3 py-1.5 font-mono text-xs text-danger hover:bg-danger hover:text-background transition-colors"
            : "rounded border border-border px-3 py-1.5 font-mono text-xs text-muted hover:border-danger hover:text-danger transition-colors"
        }
      >
        {hidden ? "Analysis hidden — Show it" : "Hide Strategic/Military Analysis from public page"}
      </button>
    </form>
  );
}
