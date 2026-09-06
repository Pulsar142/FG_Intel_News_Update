"use client";

export function DeleteButton({
  action,
  articleId,
  label = "Delete",
  confirmText = "Permanently delete this article? This cannot be undone.",
}: {
  action: (formData: FormData) => void | Promise<void>;
  articleId: string;
  label?: string;
  confirmText?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name="articleId" value={articleId} />
      <button className="rounded border border-danger px-3 py-1.5 text-danger hover:bg-danger hover:text-background transition-colors">
        {label}
      </button>
    </form>
  );
}
