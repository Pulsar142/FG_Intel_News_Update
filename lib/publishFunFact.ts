import "server-only";
import { db } from "@/lib/db";

/**
 * Publishes one fun fact, archiving whatever was previously published —
 * only one fun fact is ever shown to viewers at a time. The DB also carries
 * a partial unique index on status='PUBLISHED' as a hard backstop.
 */
export async function publishFunFact(id: string) {
  await db.$transaction([
    db.funFact.updateMany({ where: { status: "PUBLISHED" }, data: { status: "ARCHIVED" } }),
    db.funFact.update({ where: { id }, data: { status: "PUBLISHED" } }),
  ]);
}
