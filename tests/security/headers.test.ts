import { afterEach, describe, expect, it, vi } from "vitest";
import nextConfig from "../../next.config";

afterEach(() => vi.unstubAllEnvs());

async function globalHeaders() {
  const rules = await nextConfig.headers!();
  return new Map(rules.find((rule) => rule.source === "/:path*")!.headers.map(({ key, value }) => [key, value]));
}

describe("security response headers", () => {
  it("blocks framing and risky browser capabilities without restricting Next.js scripts", async () => {
    const headers = await globalHeaders();
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(headers.get("Content-Security-Policy")).not.toContain("script-src");
  });

  it("enables HSTS only for the production Vercel environment", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    expect((await globalHeaders()).has("Strict-Transport-Security")).toBe(false);
    vi.stubEnv("VERCEL_ENV", "production");
    expect((await globalHeaders()).get("Strict-Transport-Security")).toBe("max-age=31536000");
  });
});
