import "server-only";

import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { headers } from "next/headers";

type RateLimitKind = "login" | "enquiry";

const policy: Record<RateLimitKind, { limit: number; windowSeconds: number }> = {
  login: { limit: 10, windowSeconds: 15 * 60 },
  enquiry: { limit: 10, windowSeconds: 15 * 60 },
};

export function rateLimitKey(kind: RateLimitKind, clientIp: string, secret: string): string {
  return createHmac("sha256", secret).update(`${kind}:${clientIp}`).digest("hex");
}

export async function allowRequest(kind: RateLimitKind): Promise<boolean> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("Rate limiting requires NEXTAUTH_SECRET.");

  const requestHeaders = await headers();
  // Vercel overwrites this header at its edge. Do not trust caller-supplied forwarding headers elsewhere.
  const forwarded = process.env.VERCEL === "1" ? requestHeaders.get("x-vercel-forwarded-for") : null;
  const candidate = forwarded?.split(",", 1)[0]?.trim();
  const clientIp = candidate && isIP(candidate) ? candidate : "unidentified";
  const { limit, windowSeconds } = policy[kind];
  const { rateLimitRepository } = await import("@/server/db/repositories/rate-limits");
  const count = await rateLimitRepository.consume(rateLimitKey(kind, clientIp, secret), windowSeconds);
  if (Math.random() < 0.01) {
    // Bounded opportunistic cleanup; a failed cleanup cannot bypass the already-consumed limit.
    await rateLimitRepository.pruneExpired().catch(() => {});
  }
  return count <= limit;
}
