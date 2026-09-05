import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const next = request.nextUrl.searchParams.get("next") || "/";

  const record = token ? await db.accessInvite.findUnique({ where: { token } }) : null;

  if (!record || record.revoked) {
    redirect(`/login?inviteFailed=1`);
  }

  await db.accessInvite.update({ where: { token }, data: { lastUsedAt: new Date() } });
  await createSession("viewer");
  redirect(next);
}
