import "dotenv/config";

import { hash } from "bcryptjs";
import { z } from "zod";

class ProvisionRefused extends Error {}

const provisionSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(12).max(128).refine((value) => Buffer.byteLength(value, "utf8") <= 72),
});

async function main() {
  if (process.env.NODE_ENV !== "development") {
    throw new ProvisionRefused("Administrator provisioning runs only with NODE_ENV=development.");
  }

  const parsed = provisionSchema.safeParse({
    name: process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });
  if (!parsed.success) {
    throw new ProvisionRefused("Set valid ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD (12–72 UTF-8 bytes) locally.");
  }

  const { prisma } = await import("../src/server/db/client");
  try {
    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
    if (existing) throw new ProvisionRefused("A user with this email already exists; no account was changed.");

    const passwordHash = await hash(parsed.data.password, 12);
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log("Development administrator created.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof ProvisionRefused ? error.message : "Administrator provisioning failed.");
  process.exitCode = 1;
});
