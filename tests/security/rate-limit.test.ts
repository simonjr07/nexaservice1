import { beforeEach, describe, expect, it, vi } from "vitest";

const { consume, pruneExpired, requestHeaders } = vi.hoisted(() => ({
  consume: vi.fn(), pruneExpired: vi.fn(), requestHeaders: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: requestHeaders }));
vi.mock("@/server/db/repositories/rate-limits", () => ({ rateLimitRepository: { consume, pruneExpired } }));

import { allowRequest, rateLimitKey } from "@/server/security/rate-limit";

beforeEach(() => {
  vi.stubEnv("NEXTAUTH_SECRET", "unit-test-secret-with-enough-entropy");
  vi.stubEnv("VERCEL", "1");
  vi.spyOn(Math, "random").mockReturnValue(0.5);
  consume.mockReset().mockResolvedValue(1);
  pruneExpired.mockReset().mockResolvedValue(undefined);
  requestHeaders.mockReset().mockResolvedValue(new Headers({ "x-vercel-forwarded-for": "203.0.113.8" }));
});

describe("shared request rate limits", () => {
  it("uses opaque separate keys and allows requests through the configured threshold", async () => {
    consume.mockResolvedValueOnce(10).mockResolvedValueOnce(11);
    await expect(allowRequest("login")).resolves.toBe(true);
    await expect(allowRequest("login")).resolves.toBe(false);
    expect(consume).toHaveBeenCalledWith(rateLimitKey("login", "203.0.113.8", process.env.NEXTAUTH_SECRET!), 900);
    expect(rateLimitKey("login", "203.0.113.8", "secret")).not.toBe(rateLimitKey("enquiry", "203.0.113.8", "secret"));
    expect(consume.mock.calls[0][0]).not.toContain("203.0.113.8");
  });

  it("does not trust forwarding headers outside Vercel", async () => {
    vi.stubEnv("VERCEL", "");
    await allowRequest("enquiry");
    expect(consume).toHaveBeenCalledWith(rateLimitKey("enquiry", "unidentified", process.env.NEXTAUTH_SECRET!), 900);
  });

  it("fails closed when the shared store fails", async () => {
    consume.mockRejectedValueOnce(new Error("private database detail"));
    await expect(allowRequest("login")).rejects.toThrow();
  });
});
