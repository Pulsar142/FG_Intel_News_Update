import type { NextRequest } from "next/server";
import { runWeeklyGeneration } from "@/lib/weeklyRun";
import { clearFulfilledRequests } from "@/lib/clearFulfilledRequests";

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const results = await runWeeklyGeneration({ autoPublish: true });
    const cleared = await clearFulfilledRequests();
    return Response.json({ success: true, results, cleared });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
