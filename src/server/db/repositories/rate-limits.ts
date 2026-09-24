import "server-only";

import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { prisma } from "@/server/db/client";

type RateLimitDatabase = Pick<PrismaClient | Prisma.TransactionClient, "$queryRaw" | "$executeRaw">;

export function createRateLimitRepository(db: RateLimitDatabase) {
  return {
    async consume(key: string, windowSeconds: number): Promise<number> {
      const rows = await db.$queryRaw<{ count: number }[]>`
        INSERT INTO "RateLimitBucket" ("key", "count", "expiresAt")
        VALUES (${key}, 1, NOW() + ${windowSeconds} * INTERVAL '1 second')
        ON CONFLICT ("key") DO UPDATE SET
          "count" = CASE WHEN "RateLimitBucket"."expiresAt" <= NOW()
            THEN 1 ELSE "RateLimitBucket"."count" + 1 END,
          "expiresAt" = CASE WHEN "RateLimitBucket"."expiresAt" <= NOW()
            THEN NOW() + ${windowSeconds} * INTERVAL '1 second'
            ELSE "RateLimitBucket"."expiresAt" END
        RETURNING "count"
      `;
      return rows[0].count;
    },
    async pruneExpired(): Promise<void> {
      await db.$executeRaw`
        DELETE FROM "RateLimitBucket" WHERE "key" IN (
          SELECT "key" FROM "RateLimitBucket" WHERE "expiresAt" < NOW()
          ORDER BY "expiresAt" LIMIT 100
        )
      `;
    },
  };
}

export const rateLimitRepository = createRateLimitRepository(prisma);
