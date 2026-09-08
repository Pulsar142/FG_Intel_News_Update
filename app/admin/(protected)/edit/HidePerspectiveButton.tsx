"use client";

import { toggleHidePerspectiveAction } from "@/app/actions/admin";

export function HidePerspectiveButton({
  articleId,
  hidden,
}: {
  articleId: string;
  hidden: boolean;
}) {
  return (
    <form action={toggleHidePerspectiveAction}>
      <input type="hidden" name="articleId" value={articleId} />
      <button
        type="submit"
        className={
          hidden
            ? "rounded border border-danger px-3 py-1.5 font-mono text-xs text-danger hover:bg-danger hover:text-background transition-colors"
            : "rounded border border-border px-3 py-1.5 font-mono text-xs text-muted hover:border-danger hover:text-danger transition-colors"
        }
      >
        {hidden ? "Perspective hidden — Show it" : "Hide Perspective from public page"}
      </button>
    </form>
  );
}
