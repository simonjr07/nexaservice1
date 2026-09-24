import { AuthHandler } from "../../node_modules/next-auth/core/index.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { authenticateCredentials } from "@/server/auth/credentials";
import { authOptions } from "@/server/auth/options";

vi.mock("@/server/auth/credentials", () => ({ authenticateCredentials: vi.fn() }));

const mockedAuthenticate = vi.mocked(authenticateCredentials);
const internalDetail = "SENSITIVE_DATABASE_DIAGNOSTIC";

afterEach(() => vi.restoreAllMocks());

describe("Auth.js credentials callback errors", () => {
  it("turns an internal database failure into a generic client response and safe server log", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mockedAuthenticate.mockRejectedValueOnce(new Error(internalDetail));

    const options = { ...authOptions, secret: "test-only-auth-secret-with-sufficient-length" };
    const csrf = await AuthHandler({
      options,
      req: { action: "csrf", method: "GET", headers: { host: "localhost:3000" }, cookies: {}, query: {} } as never,
    });
    const csrfToken = (csrf.body as { csrfToken: string }).csrfToken;
    const csrfCookie = csrf.cookies?.find((cookie) => cookie.name.includes("csrf-token"));
    expect(csrfCookie).toBeDefined();

    const callback = await AuthHandler({
      options,
      req: {
        action: "callback",
        providerId: "credentials",
        method: "POST",
        headers: { host: "localhost:3000" },
        cookies: { [csrfCookie!.name]: csrfCookie!.value },
        body: { email: "staff@example.test", password: "test-only-password", csrfToken, json: "true" },
        query: {},
      } as never,
    });

    expect(callback.status).toBe(401);
    expect(new URL(callback.redirect!).searchParams.get("error")).toBe("CredentialsSignin");
    expect(JSON.stringify(callback)).not.toContain(internalDetail);
    expect(log.mock.calls).toEqual([["Staff sign-in could not complete due to an internal error."]]);
  });
});
