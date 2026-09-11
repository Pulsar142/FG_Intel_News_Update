import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AIRBASE_TYPE_LABELS } from "@/lib/regionalKnowledge";
import { AirbaseEditForm } from "@/app/admin/(protected)/regional-knowledge/edit/AirbaseEditForm";
import { AirbaseUnitsPanel } from "@/app/admin/(protected)/regional-knowledge/edit/AirbaseUnitsPanel";
import type { ArticleSource } from "@/lib/types";

export default async function EditAirbasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const airbase = await db.militaryAirbase.findUnique({ where: { id }, include: { units: true } });
  if (!airbase) notFound();

  const sources = JSON.parse(airbase.sources) as ArticleSource[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="stencil text-xl text-foreground">Edit Airbase</h1>
        <p className="font-mono text-xs text-gold">
          {airbase.country} — {AIRBASE_TYPE_LABELS[airbase.baseType]} — {airbase.status}
        </p>
      </div>

      <AirbaseEditForm
        id={airbase.id}
        name={airbase.name}
        country={airbase.country}
        operator={airbase.operator}
        latitude={airbase.latitude}
        longitude={airbase.longitude}
        icaoCode={airbase.icaoCode ?? ""}
        baseType={airbase.baseType}
        description={airbase.description}
        runwayDesignator={airbase.runwayDesignator}
        runwayLengthFt={airbase.runwayLengthFt}
        runwayWidthFt={airbase.runwayWidthFt}
        elevationFt={airbase.elevationFt}
        runwayCount={airbase.runwayCount}
        sources={sources.map((s) => `${s.name} | ${s.url}`).join("\n")}
      />

      <hr className="border-border" />

      <AirbaseUnitsPanel airbaseId={airbase.id} units={airbase.units} />
    </div>
  );
}
