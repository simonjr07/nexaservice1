import { randomBytes, randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { describe, expect, it } from "vitest";
import { authenticateCredentials } from "@/server/auth/credentials";

const rollback = new Error("ROLLBACK_AUTH_TEST");

describe.skipIf(process.env.RUN_DATABASE_TESTS !== "1")("PostgreSQL staff credentials", () => {
  it("authenticates a transactional staff record and leaves no test user", async () => {
    const { config } = await import("dotenv");
    config({ quiet: true });
    const { prisma } = await import("@/server/db/client");
    const email = `auth-test-${randomUUID()}@example.test`;
    const password = randomBytes(24).toString("base64url");

    try {
      await prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: {
            name: "Authentication Test",
            email,
            passwordHash: await hash(password, 12),
            role: "STAFF",
          },
        });
        const lookup = (value: string) => tx.user.findUnique({
          where: { email: value },
          select: { id: true, name: true, email: true, role: true, passwordHash: true },
        });

        await expect(authenticateCredentials({ email: email.toUpperCase(), password }, lookup)).resolves.toMatchObject({ id: created.id, role: "STAFF" });
        await expect(authenticateCredentials({ email, password: "incorrect" }, lookup)).resolves.toBeNull();
        throw rollback;
      });
    } catch (error) {
      if (error !== rollback) throw error;
    } finally {
      await prisma.$disconnect();
    }
  }, 20_000);
});
