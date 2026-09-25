import { hash } from "bcryptjs";
import { createStaffSchema } from "../src/features/staff/validation";

class BootstrapRefused extends Error {}

async function main() {
  if (process.env.NODE_ENV !== "production") {
    throw new BootstrapRefused("Production ADMIN bootstrap requires NODE_ENV=production.");
  }
  if (process.argv.slice(2).length !== 1 || process.argv[2] !== "--confirm-production-admin-bootstrap") {
    throw new BootstrapRefused("Pass --confirm-production-admin-bootstrap to run the one-time command.");
  }

  const parsed = createStaffSchema.safeParse({
    name: process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: "ADMIN",
  });
  if (!parsed.success) {
    throw new BootstrapRefused("Set valid temporary ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD inputs.");
  }

  const passwordHash = await hash(parsed.data.password, 12);
  const { prisma } = await import("../src/server/db/client");
  try {
    await prisma.$transaction(async (tx) => {
      if (await tx.user.count({ where: { role: "ADMIN" } })) {
        throw new BootstrapRefused("An ADMIN already exists; no account was created.");
      }
      await tx.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          passwordHash,
          role: "ADMIN",
          status: "ACTIVE",
        },
        select: { id: true },
      });
    }, { isolationLevel: "Serializable" });
    console.log("Exactly one initial production ADMIN created.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof BootstrapRefused ? error.message : `Production ADMIN bootstrap failed (${error instanceof Error ? error.name : "unknown"}).`);
  process.exitCode = 1;
});
