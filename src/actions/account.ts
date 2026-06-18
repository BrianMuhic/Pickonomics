"use server";

import { redirect } from "next/navigation";
import type { ActionResult } from "@/actions/auth";
import { requireUser, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function deleteAccountAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const password = String(formData.get("password") || "");

  if (!password) {
    return { error: "Password is required to delete your account" };
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) {
    return { error: "Account not found" };
  }

  const valid = await verifyPassword(password, dbUser.passwordHash);
  if (!valid) {
    return { error: "Incorrect password" };
  }

  await prisma.$transaction([
    prisma.league.deleteMany({ where: { commissionerId: user.id } }),
    prisma.user.delete({ where: { id: user.id } }),
  ]);

  const session = await getSession();
  session.destroy();
  redirect("/login");
}
