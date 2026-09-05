import { GenerateForm } from "@/app/admin/(protected)/generate/GenerateForm";

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; country?: string }>;
}) {
  const { region, country } = await searchParams;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="stencil text-xl text-foreground">Generate</h1>
      <p className="max-w-xl font-mono text-xs text-muted">
        Manually trigger the pipeline for a region, or type any country name under &quot;Custom&quot;
        to draft an ad-hoc briefing for it. New drafts land in Pending Review — nothing goes live
        until you publish it there, even if you&apos;re replacing something already published.
      </p>
      <GenerateForm defaultRegion={region} defaultCountry={country} />
    </div>
  );
}
