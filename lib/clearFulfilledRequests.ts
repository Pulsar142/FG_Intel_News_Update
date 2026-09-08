import "server-only";
import { db } from "@/lib/db";

/**
 * Weekly maintenance: clears out FULFILLED free-generation, fun-fact, and
 * aircraft-recognition requests so the admin's request queues don't grow
 * forever. PENDING and FAILED requests are left alone — only requests that
 * already resulted in a published draft (and are just sitting there as a
 * stale log entry) are removed.
 */
export async function clearFulfilledRequests() {
  const [generationRequests, funFactRequests, aircraftRecognitionRequests] = await db.$transaction([
    db.generationRequest.deleteMany({ where: { status: "FULFILLED" } }),
    db.funFactRequest.deleteMany({ where: { status: "FULFILLED" } }),
    db.aircraftRecognitionRequest.deleteMany({ where: { status: "FULFILLED" } }),
  ]);
  return {
    generationRequestsCleared: generationRequests.count,
    funFactRequestsCleared: funFactRequests.count,
    aircraftRecognitionRequestsCleared: aircraftRecognitionRequests.count,
  };
}
