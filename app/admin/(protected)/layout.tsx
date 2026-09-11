import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/app/actions/auth";

const TABS = [
  { href: "/admin/pending", label: "Pending Review" },
  { href: "/admin/published", label: "Published" },
  { href: "/admin/archived", label: "Archived" },
  { href: "/admin/generate", label: "Generate" },
  { href: "/admin/aviation-safety", label: "Aviation Safety" },
  { href: "/admin/regional-knowledge", label: "Regional Knowledge" },
  { href: "/admin/settings", label: "Sources & Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session?.role !== "admin") redirect("/admin/login");

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-panel/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" className="flex items-baseline gap-2">
            <span className="stencil text-lg font-bold tracking-widest text-foreground">
              Data Driven Combat Readiness
            </span>
            <span className="font-mono text-[10px] tracking-[0.25em] text-gold">/ COMMAND</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="rounded border border-border px-3 py-1.5 text-muted hover:border-accent hover:text-accent-strong transition-colors"
              >
                {t.label}
              </Link>
            ))}
            <Link
              href="/"
              className="rounded border border-border px-3 py-1.5 text-muted hover:text-foreground transition-colors"
            >
              View Site
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded border border-border px-3 py-1.5 text-muted hover:border-danger hover:text-danger transition-colors"
              >
                Log out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </>
  );
}
