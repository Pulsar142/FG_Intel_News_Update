import { db } from "@/lib/db";
import { CORE_REGIONS, OPTIONAL_REGIONS, REGION_LABELS, SOURCES } from "@/lib/sources";
import { toggleRegionAction, createInviteAction, revokeInviteAction } from "@/app/actions/admin";

export default async function SettingsPage() {
  const settings = await db.regionSetting.findMany();
  const enabledMap = new Map(settings.map((s) => [s.region, s.enabled]));
  const invites = await db.accessInvite.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="stencil mb-2 text-xl text-foreground">Regions</h1>
        <p className="mb-4 font-mono text-xs text-muted">
          Singapore, South-East Asia, Global and USA are always on. Malaysia and Indonesia can be
          switched off to hide them from the public site&apos;s region tabs and archive.
        </p>
        <div className="flex flex-wrap gap-2">
          {CORE_REGIONS.map((r) => (
            <span
              key={r}
              className="stencil rounded-full border border-border px-4 py-1.5 text-xs tracking-widest text-muted"
            >
              {REGION_LABELS[r]} — always on
            </span>
          ))}
          {OPTIONAL_REGIONS.map((r) => {
            const enabled = enabledMap.get(r) ?? true;
            return (
              <form key={r} action={toggleRegionAction}>
                <input type="hidden" name="region" value={r} />
                <input type="hidden" name="enabled" value={(!enabled).toString()} />
                <button
                  className={`stencil rounded-full border px-4 py-1.5 text-xs tracking-widest transition-colors ${
                    enabled
                      ? "border-accent bg-accent text-background"
                      : "border-border text-muted hover:text-foreground"
                  }`}
                >
                  {REGION_LABELS[r]} — {enabled ? "On" : "Off"}
                </button>
              </form>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="stencil mb-2 text-xl text-foreground">Curated Sources</h2>
        <p className="mb-4 font-mono text-xs text-muted">
          Every generation also runs a live web search alongside these, so it isn&apos;t limited to
          this list — these are just the outlets checked directly first. Edit{" "}
          <code>lib/sources.ts</code> to change them — no other code changes needed.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(SOURCES).map(([region, sources]) => (
            <div key={region} className="rounded border border-border bg-panel p-3">
              <p className="stencil mb-2 text-xs tracking-widest text-gold">
                {REGION_LABELS[region as keyof typeof REGION_LABELS]}
              </p>
              <ul className="flex flex-col gap-1 font-mono text-xs text-muted">
                {sources.map((s) => (
                  <li key={s.url}>{s.name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="stencil mb-2 text-xl text-foreground">Invite Links</h2>
        <p className="mb-4 font-mono text-xs text-muted">
          Anyone with an active link can view the site without the shared password:{" "}
          <code>/login?invite=&lt;token&gt;</code>
        </p>
        <form action={createInviteAction} className="mb-4 flex gap-2">
          <input
            type="text"
            name="label"
            placeholder="Label (optional, e.g. a name)"
            className="flex-1 rounded border border-border bg-panel-2 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
          <button className="stencil rounded bg-accent px-4 py-2 text-xs font-semibold tracking-widest text-background hover:bg-accent-strong transition-colors">
            Create Invite
          </button>
        </form>
        <div className="flex flex-col gap-2">
          {invites.length === 0 && (
            <p className="text-sm text-muted">No invite links yet.</p>
          )}
          {invites.map((inv) => (
            <div
              key={inv.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-border bg-panel p-3"
            >
              <div className="font-mono text-xs">
                <p className={inv.revoked ? "text-muted line-through" : "text-foreground"}>
                  /login?invite={inv.token}
                </p>
                <p className="text-muted">{inv.label ?? "(no label)"}</p>
              </div>
              {!inv.revoked && (
                <form action={revokeInviteAction}>
                  <input type="hidden" name="id" value={inv.id} />
                  <button className="rounded border border-border px-3 py-1 font-mono text-xs text-muted hover:border-danger hover:text-danger transition-colors">
                    Revoke
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
