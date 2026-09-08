import "server-only";
import { db } from "@/lib/db";

/**
 * Publishes one Aircraft Recognition card, archiving whatever was previously
 * published — only one card is ever shown to viewers at a time. The DB also
 * carries a partial unique index on status='PUBLISHED' as a hard backstop.
 */
export async function publishAircraftRecognition(id: string) {
  await db.$transaction([
    db.aircraftRecognition.updateMany({ where: { status: "PUBLISHED" }, data: { status: "ARCHIVED" } }),
    db.aircraftRecognition.update({ where: { id }, data: { status: "PUBLISHED" } }),
  ]);
}
