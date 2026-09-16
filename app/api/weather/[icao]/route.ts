import { fetchAerodromeWeather } from "@/lib/aerodromeWeather";

export async function GET(_request: Request, { params }: { params: Promise<{ icao: string }> }) {
  const { icao } = await params;
  const weather = await fetchAerodromeWeather(icao);
  if (!weather) {
    return Response.json({ error: "No live METAR report available for this station." }, { status: 404 });
  }
  return Response.json(weather);
}
