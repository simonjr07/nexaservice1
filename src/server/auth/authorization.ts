import "server-only";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Role } from "@/generated/prisma/client";
import { authOptions } from "@/server/auth/options";
import type { StaffIdentity } from "@/server/auth/credentials";

export class ForbiddenError extends Error {
  constructor() {
    super("Forbidden");
    this.name = "ForbiddenError";
  }
}

export function assertStaffRole(role: Role): void {
  if (role !== "ADMIN" && role !== "STAFF") throw new ForbiddenError();
}

export function assertAdminRole(role: Role): void {
  if (role !== "ADMIN") throw new ForbiddenError();
}

export async function getCurrentUser(): Promise<StaffIdentity | null> {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (!id) return null;

  // Re-read the account so deletion, disablement, or role changes take effect before the JWT expires.
  const { prisma } = await import("@/server/db/client");
  const user = await prisma.user.findUnique({
    where: { id, status: "ACTIVE" },
    select: { id: true, name: true, email: true, role: true, status: true },
  });
  if (!user || user.status !== "ACTIVE") return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function requireAuthenticatedUser(): Promise<StaffIdentity> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requireStaff(): Promise<StaffIdentity> {
  const user = await requireAuthenticatedUser();
  assertStaffRole(user.role);
  return user;
}

export async function requireAdmin(): Promise<StaffIdentity> {
  const user = await requireAuthenticatedUser();
  assertAdminRole(user.role);
  return user;
}
