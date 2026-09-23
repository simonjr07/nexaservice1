import { hash } from "bcryptjs";
import { describe, expect, it } from "vitest";
import { authenticateCredentials } from "@/server/auth/credentials";
import { authOptions } from "@/server/auth/options";

const record = {
  id: "73affcbe-9500-4ac5-b5c8-b0d7b89ee698",
  name: "Example Staff",
  email: "staff@example.test",
  role: "STAFF" as const,
  passwordHash: "",
};

describe("staff credentials", () => {
  it("accepts valid credentials and normalizes the email without returning the hash", async () => {
    const user = { ...record, passwordHash: await hash("correct horse battery", 4) };
    const lookup = async (email: string) => {
      expect(email).toBe("staff@example.test");
      return user;
    };

    await expect(authenticateCredentials({ email: " STAFF@EXAMPLE.TEST ", password: "correct horse battery" }, lookup)).resolves.toEqual({
      id: record.id, name: record.name, email: record.email, role: "STAFF",
    });
  });

  it("rejects an incorrect password and an unknown email the same way", async () => {
    const user = { ...record, passwordHash: await hash("correct horse battery", 4) };
    await expect(authenticateCredentials({ email: record.email, password: "incorrect" }, async () => user)).resolves.toBeNull();
    await expect(authenticateCredentials({ email: "unknown@example.test", password: "incorrect" }, async () => null)).resolves.toBeNull();
  });

  it("rejects malformed input before lookup", async () => {
    await expect(authenticateCredentials({ email: "invalid", password: "" }, async () => {
      throw new Error("lookup should not run");
    })).resolves.toBeNull();
  });

  it("exposes only identity fields in the Auth.js session callback", async () => {
    const session = await authOptions.callbacks.session({
      session: { user: { name: "Old" }, expires: "2099-01-01" },
      token: { sub: record.id, name: record.name, email: record.email, role: "STAFF", passwordHash: "never-expose" },
    } as never);
    expect(session.user).toEqual({ id: record.id, name: record.name, email: record.email, role: "STAFF" });
    expect(JSON.stringify(session)).not.toContain("never-expose");
  });
});
