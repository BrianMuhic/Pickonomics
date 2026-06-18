import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function isAdminEmail(email: string) {
  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

export async function requireUser() {
  const session = await getSession();
  if (!session.user) {
    redirect("/login");
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user.isAdmin) {
    redirect("/");
  }
  return user;
}

export async function getCurrentUser() {
  const session = await getSession();
  return session.user ?? null;
}

export function generateResetToken() {
  return randomBytes(32).toString("hex");
}

export async function findUserByLogin(login: string) {
  const trimmed = login.trim();
  return prisma.user.findFirst({
    where: {
      OR: [{ username: trimmed }, { email: trimmed.toLowerCase() }],
    },
  });
}
