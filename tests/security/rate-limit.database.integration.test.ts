import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

const rollback = new Error("ROLLBACK_RATE_LIMIT_TEST");

describe.skipIf(process.env.RUN_DATABASE_TESTS !== "1")("PostgreSQL request rate limits", () => {
  it("atomically counts a window, resets an expired bucket, and rolls back", async () => {
    const { config } = await import("dotenv");
    config({ quiet: true });
    const { prisma } = await import("@/server/db/client");
    const { createRateLimitRepository } = await import("@/server/db/repositories/rate-limits");
    const key = randomUUID().replace(/-/g, "").padEnd(64, "0");
    try {
      await prisma.$transaction(async (tx) => {
        const repository = createRateLimitRepository(tx);
        expect(await repository.consume(key, 900)).toBe(1);
        expect(await repository.consume(key, 900)).toBe(2);
        await tx.rateLimitBucket.update({ where: { key }, data: { expiresAt: new Date(0) } });
        expect(await repository.consume(key, 900)).toBe(1);
        throw rollback;
      });
    } catch (error) {
      if (error !== rollback) throw error;
    } finally {
      expect(await prisma.rateLimitBucket.count({ where: { key } })).toBe(0);
      await prisma.$disconnect();
    }
  }, 20_000);

  it("preserves every concurrent attempt from separate requests", async () => {
    const { config } = await import("dotenv");
    config({ quiet: true });
    const { prisma } = await import("@/server/db/client");
    const { createRateLimitRepository } = await import("@/server/db/repositories/rate-limits");
    const key = randomUUID().replace(/-/g, "").padEnd(64, "0");
    try {
      const repository = createRateLimitRepository(prisma);
      const counts = await Promise.all(Array.from({ length: 8 }, () => repository.consume(key, 900)));
      expect(counts.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    } finally {
      await prisma.rateLimitBucket.deleteMany({ where: { key } });
      await prisma.$disconnect();
    }
  }, 20_000);
});
