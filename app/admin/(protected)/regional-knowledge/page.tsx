import Link from "next/link";
import { db } from "@/lib/db";
import { AIRBASE_TYPE_LABELS } from "@/lib/regionalKnowledge";
import { publishAirbaseAction, archiveAirbaseAction, deleteAirbaseAction } from "@/app/actions/admin";

export default async function RegionalKnowledgeAdminPage() {
  const airbases = await db.militaryAirbase.findMany({
    orderBy: [{ country: "asc" }, { name: "asc" }],
    include: { units: true },
  });

  const drafts = airbases.filter((a) => a.status === "DRAFT");
  const published = airbases.filter((a) => a.status === "PUBLISHED");
  const archived = airbases.filter((a) => a.status === "ARCHIVED");

  const Row = ({ a }: { a: (typeof airbases)[number] }) => (
    <div className="flex flex-col gap-2 rounded border border-border bg-panel p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="stencil text-xs tracking-widest text-gold">
          {a.country} — {AIRBASE_TYPE_LABELS[a.baseType]}
        </p>
        <h2 className="text-base font-semibold text-foreground">{a.name}</h2>
        <p className="text-sm text-muted">
          {a.operator} · {a.units.length} unit{a.units.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 font-mono text-xs">
        <Link
          href={`/admin/regional-knowledge/edit/${a.id}`}
          className="rounded border border-accent px-3 py-1.5 text-accent-strong hover:bg-accent hover:text-background transition-colors"
        >
          Edit
        </Link>
        {a.status !== "PUBLISHED" && (
          <form action={publishAirbaseAction}>
            <input type="hidden" name="id" value={a.id} />
            <button className="rounded border border-accent-strong px-3 py-1.5 text-accent-strong hover:bg-accent-strong hover:text-background transition-colors">
              Publish
            </button>
          </form>
        )}
        {a.status !== "ARCHIVED" && (
          <form action={archiveAirbaseAction}>
            <input type="hidden" name="id" value={a.id} />
            <button className="rounded border border-border px-3 py-1.5 text-muted hover:border-gold hover:text-gold transition-colors">
              Archive
            </button>
          </form>
        )}
        <form action={deleteAirbaseAction}>
          <input type="hidden" name="id" value={a.id} />
          <button className="rounded border border-danger/60 px-3 py-1.5 text-danger hover:bg-danger hover:text-background transition-colors">
            Delete
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="stencil text-xl text-foreground">Regional Knowledge</h1>
          <p className="max-w-xl font-mono text-xs text-muted">
            OSINT-compiled military airbases across Singapore, Indonesia, Brunei, Philippines, Vietnam,
            Cambodia, Thailand, Malaysia, and the South China Sea. Compiled from public reporting —
            never classified sources. Review and publish here before they appear on the public map.
          </p>
        </div>
        <Link
          href="/admin/regional-knowledge/new"
          className="stencil rounded bg-accent px-4 py-2 text-xs font-semibold tracking-widest text-background hover:bg-accent-strong transition-colors"
        >
          + Add Airbase
        </Link>
      </div>

      {drafts.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="stencil text-xs tracking-widest text-gold">Draft ({drafts.length})</h2>
          {drafts.map((a) => (
            <Row key={a.id} a={a} />
          ))}
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="stencil text-xs tracking-widest text-accent-strong">Published ({published.length})</h2>
        {published.map((a) => (
          <Row key={a.id} a={a} />
        ))}
      </section>

      {archived.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="stencil text-xs tracking-widest text-muted">Archived ({archived.length})</h2>
          {archived.map((a) => (
            <Row key={a.id} a={a} />
          ))}
        </section>
      )}
    </div>
  );
}
