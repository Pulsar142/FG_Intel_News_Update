"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";

export type AuthFormState = { error?: string } | undefined;

export async function siteLoginAction(
  _state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const password = String(formData.get("password") ?? "");
  const invite = String(formData.get("invite") ?? "").trim();
  const next = String(formData.get("next") ?? "/");

  if (invite) {
    const record = await db.accessInvite.findUnique({ where: { token: invite } });
    if (record && !record.revoked) {
      await db.accessInvite.update({
        where: { token: invite },
        data: { lastUsedAt: new Date() },
      });
      await createSession("viewer");
      redirect(next || "/");
    }
    return { error: "That invite link is invalid or has been revoked." };
  }

  if (password && password === process.env.SITE_PASSWORD) {
    await createSession("viewer");
    redirect(next || "/");
  }

  return { error: "Incorrect password." };
}

export async function adminLoginAction(
  _state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const password = String(formData.get("password") ?? "");
  if (password && password === process.env.ADMIN_PASSWORD) {
    await createSession("admin");
    redirect("/admin");
  }
  return { error: "Incorrect admin password." };
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
