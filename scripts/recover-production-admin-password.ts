import { compare, hash } from "bcryptjs";
import { createStaffSchema } from "../src/features/staff/validation";

class RecoveryRefused extends Error {}

async function main() {
  if (process.env.NODE_ENV !== "production") {
    throw new RecoveryRefused("Production ADMIN recovery requires NODE_ENV=production.");
  }
  if (process.argv.slice(2).length !== 1 || process.argv[2] !== "--confirm-production-admin-recovery") {
    throw new RecoveryRefused("Pass --confirm-production-admin-recovery to update an existing ADMIN password.");
  }

  const email = createStaffSchema.shape.email.safeParse(process.env.ADMIN_EMAIL);
  const password = createStaffSchema.shape.password.safeParse(process.env.ADMIN_PASSWORD);
  if (!email.success || !password.success) {
    throw new RecoveryRefused("Set valid temporary ADMIN_EMAIL and ADMIN_PASSWORD inputs.");
  }

  const passwordHash = await hash(password.data, 12);
  const { prisma } = await import("../src/server/db/client");
  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({
        where: { email: email.data },
        select: { id: true, role: true, status: true },
      });
      if (!existing || existing.role !== "ADMIN" || existing.status !== "ACTIVE") {
        throw new RecoveryRefused("An existing ACTIVE ADMIN was not found; nothing was changed.");
      }

      // Update only passwordHash; Prisma's @updatedAt would also change updatedAt.
      const count = await tx.$executeRaw`
        UPDATE "User" SET "passwordHash" = ${passwordHash}
        WHERE "id" = ${existing.id}::uuid
          AND "email" = ${email.data}
          AND "role" = 'ADMIN'
          AND "status" = 'ACTIVE'
      `;
      if (count !== 1) throw new RecoveryRefused("Exactly one existing ACTIVE ADMIN must be updated; nothing was changed.");

      const updated = await tx.user.findUnique({
        where: { id: existing.id },
        select: { passwordHash: true },
      });
      if (!updated || !(await compare(password.data, updated.passwordHash))) {
        throw new RecoveryRefused("Password verification failed; the transaction was rolled back.");
      }
    }, { isolationLevel: "Serializable" });
    console.log("Existing ACTIVE ADMIN password updated and bcrypt verification passed.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof RecoveryRefused ? error.message : "Production ADMIN recovery failed.");
  process.exitCode = 1;
});
