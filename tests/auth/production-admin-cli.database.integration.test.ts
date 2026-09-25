import { randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { compare } from "bcryptjs";
import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const tsxCli = require.resolve("tsx/cli");
const confirmBootstrap = "--confirm-production-admin-bootstrap";
const confirmRecovery = "--confirm-production-admin-recovery";

describe.skipIf(process.env.RUN_DATABASE_TESTS !== "1")("production ADMIN CLIs on a disposable PostgreSQL database", () => {
  const databaseName = `nexaservice_admin_cli_${randomUUID().replaceAll("-", "")}`;
  const email = `admin-${randomUUID()}@example.test`;
  const firstPassword = randomBytes(24).toString("base64url");
  const replacementPassword = randomBytes(24).toString("base64url");
  let baseClient: Client;
  let disposableClient: Client;
  let disposableUrl: string;
  let localUrl: string | undefined;

  function run(script: string, args: string[], overrides: Record<string, string> = {}) {
    const result = spawnSync(process.execPath, [tsxCli, script, ...args], {
      cwd: process.cwd(),
      encoding: "utf8",
      timeout: 45_000,
      env: {
        ...process.env,
        NODE_ENV: "production",
        DATABASE_URL: disposableUrl,
        ADMIN_NAME: "Fictional Initial Admin",
        ADMIN_EMAIL: email,
        ADMIN_PASSWORD: firstPassword,
        ...(process.platform === "win32" ? {
          NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ""} --require="${join(process.cwd(), "tests", "helpers", "tsx-userinfo-preload.cjs").replaceAll("\\", "/")}"`.trim(),
        } : {}),
        ...overrides,
      },
    });
    const output = `${result.stdout}${result.stderr}`;
    for (const secret of [email, firstPassword, replacementPassword, disposableUrl, overrides.ADMIN_EMAIL, overrides.ADMIN_PASSWORD]) {
      if (secret && secret.length > 8 && output.includes(secret)) {
        throw new Error("ADMIN CLI output contained sensitive input.");
      }
    }
    return result;
  }

  beforeAll(async () => {
    const { config } = await import("dotenv");
    config({ quiet: true });
    const baseUrl = process.env.DATABASE_URL;
    if (!baseUrl) throw new Error("DATABASE_URL is required for disposable database tests.");
    const parsed = new URL(baseUrl);
    if (!["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname)) {
      throw new Error("Production ADMIN CLI tests require a local PostgreSQL server.");
    }
    localUrl = baseUrl;
    parsed.pathname = `/${databaseName}`;
    disposableUrl = parsed.toString();

    baseClient = new Client({ connectionString: baseUrl, connectionTimeoutMillis: 5_000, query_timeout: 30_000 });
    await baseClient.connect();
    await baseClient.query(`CREATE DATABASE "${databaseName}"`);
    disposableClient = new Client({ connectionString: disposableUrl, connectionTimeoutMillis: 5_000, query_timeout: 30_000 });
    await disposableClient.connect();
    const migrationsDir = join(process.cwd(), "prisma", "migrations");
    for (const directory of readdirSync(migrationsDir).filter((item) => /^\d+_/.test(item)).sort()) {
      await disposableClient.query(readFileSync(join(migrationsDir, directory, "migration.sql"), "utf8"));
    }
  }, 90_000);

  afterAll(async () => {
    if (disposableClient) await disposableClient.end();
    if (baseClient) await baseClient.end().catch(() => undefined);
    if (localUrl) {
      // CREATE DATABASE can finish after a query timeout; inspect the exact random name.
      const cleanup = new Client({ connectionString: localUrl, connectionTimeoutMillis: 5_000 });
      await cleanup.connect();
      try {
        const exists = await cleanup.query("SELECT 1 FROM pg_database WHERE datname = $1", [databaseName]);
        if (exists.rowCount === 1) await cleanup.query(`DROP DATABASE "${databaseName}" WITH (FORCE)`);
      } finally {
        await cleanup.end();
      }
    }
  }, 60_000);

  it("requires production and an explicit flag, then creates one ACTIVE ADMIN with a bcrypt hash", async () => {
    const script = "scripts/bootstrap-production-admin.ts";
    expect(run(script, [confirmBootstrap], { NODE_ENV: "development" }).status).not.toBe(0);
    expect(run(script, []).status).not.toBe(0);
    expect(run(script, [confirmBootstrap], { ADMIN_PASSWORD: "short" }).status).not.toBe(0);
    expect(Number((await disposableClient.query(`SELECT count(*)::int AS count FROM "User"`)).rows[0].count)).toBe(0);

    const createdResult = run(script, [confirmBootstrap]);
    expect(createdResult.status).toBe(0);
    const rows = (await disposableClient.query(`SELECT "role", "status", "passwordHash" FROM "User"`)).rows;
    expect(rows.length).toBe(1);
    expect(rows[0].role).toBe("ADMIN");
    expect(rows[0].status).toBe("ACTIVE");
    expect(await compare(firstPassword, rows[0].passwordHash)).toBe(true);
    expect(/^\$2[aby]\$12\$/.test(rows[0].passwordHash)).toBe(true);
    if (`${createdResult.stdout}${createdResult.stderr}`.includes(rows[0].passwordHash)) throw new Error("ADMIN CLI output contained a password hash.");

    const repeated = run(script, [confirmBootstrap], { ADMIN_EMAIL: `other-${randomUUID()}@example.test` });
    expect(repeated.status).not.toBe(0);
    expect(Number((await disposableClient.query(`SELECT count(*)::int AS count FROM "User"`)).rows[0].count)).toBe(1);
  }, 90_000);

  it("recovers only the existing ADMIN passwordHash and refuses unconfirmed or unknown updates", async () => {
    const script = "scripts/recover-production-admin-password.ts";
    const beforeRow = (await disposableClient.query(`SELECT "name", "email", "role", "status", "createdAt", "updatedAt" FROM "User"`)).rows[0];
    expect(run(script, [confirmRecovery], { NODE_ENV: "development" }).status).not.toBe(0);
    expect(run(script, []).status).not.toBe(0);
    expect(run(script, [confirmRecovery], { ADMIN_EMAIL: `unknown-${randomUUID()}@example.test` }).status).not.toBe(0);
    expect(run(script, [confirmRecovery], { ADMIN_PASSWORD: "short" }).status).not.toBe(0);

    const recovered = run(script, [confirmRecovery], { ADMIN_PASSWORD: replacementPassword });
    expect(recovered.status).toBe(0);
    const afterRow = (await disposableClient.query(`SELECT "name", "email", "role", "status", "createdAt", "updatedAt", "passwordHash" FROM "User"`)).rows[0];
    expect({
      name: afterRow.name, email: afterRow.email, role: afterRow.role, status: afterRow.status,
      createdAt: afterRow.createdAt, updatedAt: afterRow.updatedAt,
    }).toEqual(beforeRow);
    expect(await compare(firstPassword, afterRow.passwordHash)).toBe(false);
    expect(await compare(replacementPassword, afterRow.passwordHash)).toBe(true);
    if (`${recovered.stdout}${recovered.stderr}`.includes(afterRow.passwordHash)) throw new Error("ADMIN CLI output contained a password hash.");
    expect(Number((await disposableClient.query(`SELECT count(*)::int AS count FROM "User"`)).rows[0].count)).toBe(1);
  }, 90_000);
});
