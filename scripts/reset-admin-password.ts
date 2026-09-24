import "dotenv/config";

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { compare, hash } from "bcryptjs";
import { parse } from "dotenv";
import { createStaffSchema } from "../src/features/staff/validation";

class ResetRefused extends Error {}

async function main() {
  if (process.env.NODE_ENV !== "development") {
    throw new ResetRefused("Password reset requires NODE_ENV=development.");
  }

  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) throw new ResetRefused("A local .env file is required.");
  const localEnv = parse(readFileSync(envPath));
  const email = createStaffSchema.shape.email.safeParse(localEnv.ADMIN_EMAIL);
  const password = createStaffSchema.shape.password.safeParse(localEnv.ADMIN_PASSWORD);
  if (!email.success || !password.success) {
    throw new ResetRefused("Set valid ADMIN_EMAIL and ADMIN_PASSWORD in .env before resetting.");
  }

  if (!localEnv.DATABASE_URL || process.env.DATABASE_URL !== localEnv.DATABASE_URL) {
    throw new ResetRefused("DATABASE_URL must match the local .env file.");
  }
  let databaseHost: string;
  try {
    databaseHost = new URL(localEnv.DATABASE_URL).hostname;
  } catch {
    throw new ResetRefused("DATABASE_URL in .env is invalid.");
  }
  if (!["127.0.0.1", "localhost", "[::1]"].includes(databaseHost)) {
    throw new ResetRefused("Password reset requires a localhost development database.");
  }

  const passwordHash = await hash(password.data, 12);
  const { prisma } = await import("../src/server/db/client");
  try {
    const updatedCount = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({
        where: { email: email.data },
        select: { id: true, role: true, status: true },
      });
      if (!existing || existing.role !== "ADMIN" || existing.status !== "ACTIVE") {
        throw new ResetRefused("An existing ACTIVE ADMIN with ADMIN_EMAIL was not found; nothing was changed.");
      }

      // Raw SQL changes only passwordHash; Prisma's @updatedAt would also change updatedAt.
      const count = await tx.$executeRaw`
        UPDATE "User" SET "passwordHash" = ${passwordHash}
        WHERE "id" = ${existing.id}::uuid
          AND "email" = ${email.data}
          AND "role" = 'ADMIN'
          AND "status" = 'ACTIVE'
      `;
      if (count !== 1) throw new ResetRefused("Exactly one existing ADMIN must be updated; nothing was changed.");

      const updated = await tx.user.findUnique({
        where: { id: existing.id },
        select: { passwordHash: true },
      });
      if (!updated || !(await compare(password.data, updated.passwordHash))) {
        throw new ResetRefused("Password verification failed; the transaction was rolled back.");
      }
      return count;
    });
    console.log(`Existing ACTIVE ADMIN password updated: ${updatedCount === 1}. Bcrypt verification passed: true.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof ResetRefused ? error.message : "Development admin password reset failed.");
  process.exitCode = 1;
});
