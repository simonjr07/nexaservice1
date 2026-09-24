import "server-only";

import { randomBytes } from "node:crypto";
import { compare, hashSync } from "bcryptjs";
import { z } from "zod";
import type { AccountStatus, Role } from "@/generated/prisma/client";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(1024),
});

export type StaffIdentity = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type CredentialRecord = StaffIdentity & { passwordHash: string; status: AccountStatus };
type UserLookup = (email: string) => Promise<CredentialRecord | null>;

// An unrelated random hash makes unknown-account checks perform a password comparison too.
const absentUserHash = hashSync(randomBytes(32).toString("hex"), 12);

async function findUserByEmail(email: string): Promise<CredentialRecord | null> {
  const { prisma } = await import("@/server/db/client");
  return prisma.user.findUnique({
    where: { email, status: "ACTIVE" },
    select: { id: true, name: true, email: true, role: true, status: true, passwordHash: true },
  });
}

export async function authenticateCredentials(
  input: unknown,
  lookup: UserLookup = findUserByEmail,
): Promise<StaffIdentity | null> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return null;

  const user = await lookup(parsed.data.email);
  const validPassword = await compare(parsed.data.password, user?.passwordHash ?? absentUserHash);
  if (!user || user.status !== "ACTIVE" || !validPassword) return null;

  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
