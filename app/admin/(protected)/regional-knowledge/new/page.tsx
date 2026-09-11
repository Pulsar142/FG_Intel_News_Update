import { AirbaseCreateForm } from "@/app/admin/(protected)/regional-knowledge/new/AirbaseCreateForm";

export default function NewAirbasePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="stencil text-xl text-foreground">Add Airbase</h1>
      <p className="max-w-xl font-mono text-xs text-muted">
        Lands as a draft. After saving, you&apos;ll add its resident units (squadrons, air defence, support,
        ammunition depot) on the next page.
      </p>
      <AirbaseCreateForm />
    </div>
  );
}
