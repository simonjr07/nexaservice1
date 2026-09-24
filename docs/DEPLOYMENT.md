# Development and deployment plan

## Current status

The local Docker Compose, Prisma, and staff authentication configuration are checked in. GitHub Actions CI is configured for pull requests and pushes to `main`, but no remote run has been verified yet. CI does not deploy. The three checked-in migrations were previously applied to local PostgreSQL; Docker container health and a full browser sign-in/sign-out with a provisioned account remain unverified here. Vercel hosting, hosted PostgreSQL, and a production administrator are not provisioned.

## Local PostgreSQL setup

Prerequisites: Node.js 24 LTS (recorded in `.nvmrc`), npm, Docker Desktop/Engine with Compose, and an available localhost port (5432 by default). `compose.yaml` runs only official `postgres:17-bookworm`, publishes its port on `127.0.0.1`, stores data in the `postgres_data` named volume, and uses `pg_isready` as a health check. This is a local development database, not production hosting.

1. Copy `.env.example` to `.env` (PowerShell: `Copy-Item .env.example .env`). Edit `.env` with a **new local-only** `POSTGRES_PASSWORD`; keep `DATABASE_URL` consistent with the user, password, database, and port. URL-encode special password characters. Set `NEXTAUTH_SECRET` to a long random value (for example, generate one locally with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`) and `NEXTAUTH_URL=http://localhost:3000`. `.env` is Git-ignored; do not commit it.
2. Run `docker compose up -d db`.
3. Run `docker compose ps` and wait for `db` to report **healthy**. For a direct check in PowerShell, run `docker compose exec db sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'`.
4. Run `npm ci`, then `npm run db:validate` and `npm run db:generate`. The install and build scripts also generate Prisma Client; validation/generation do not require a live database.
5. Run `npm run db:deploy` to apply checked-in migrations to a fresh or existing local database without generating new migrations. For a later schema change, use `npm run db:migrate -- --name descriptive_change` against the development database. Run `npx prisma migrate status` to confirm migration state.
6. Supply your own local administrator name, email, and password and run the explicit [provisioning command](SECURITY.md#development-admin-provisioning) for the first ADMIN. The command requires `NODE_ENV=development` and does not run automatically. Thereafter an active ADMIN can manage internal accounts at `/admin/users`; no public registration is available.
7. Run `npm run dev`. npm runs `predev` first to regenerate Prisma Client, then starts the unchanged `next dev` command. Visit `/admin/login` and verify sign-in, role-appropriate placeholders, sign-out, and that `/admin` redirects back to login after sign-out. The protected workspace checks the current `User` row on each request.

Stop the container with `docker compose down`; this keeps the named volume. Do **not** use `docker compose down -v` unless you intend to delete all local database data. Changing `POSTGRES_USER`, `POSTGRES_PASSWORD`, or `POSTGRES_DB` after the volume has been initialized does not update existing PostgreSQL credentials; plan such changes deliberately.

## Prisma configuration and commands

Prisma CLI, Client, and PostgreSQL adapter are on the compatible 7.10.0 stable line. At selection time, npm's `latest` tag pointed to Prisma 8.0.0-rc.15, a release candidate, so this project chose the supported stable line rather than a prerelease. Prisma 7.10 uses `prisma7.config.ts` for the connection URL and `prisma/schema.prisma` for the datasource provider and Client generator. The generated Client goes to ignored `src/generated/prisma`; imports belong in server code only. `src/server/db/client.ts` creates a single adapter-backed Client and requires `DATABASE_URL` at runtime. Checked-in SQL migrations cover the initial schema and User account status.

Useful commands: `npm run db:validate`, `npm run db:generate`, `npm run db:deploy`, `npm run db:migrate` (authoring only), `npx prisma migrate status`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. Prisma 7 does not generate Client automatically after `migrate dev`; run `db:generate` after schema changes when using Prisma outside `npm run dev`. The `predev` hook regenerates Client at every development startup. Never use a reset command against data that must be retained.

## Development data

No seed data or administrator account is included. An explicit development-only administrator command is available after migration; it uses locally supplied values and hashes the password. Future seed data should be clearly fictional, limited to non-sensitive demo content, and reproducible. The production administrator approach is proposed below and requires approval before implementation; no public or hard-coded administrator password belongs in source control.

## GitHub Actions CI

`.github/workflows/ci.yml` runs on pull requests targeting `main` and pushes to `main`, using Node.js 24 LTS and `npm ci` from the committed lockfile. The one job starts an isolated `postgres:17-bookworm` service with a health check and a CI-only database/password on the hosted runner. It generates an ephemeral `NEXTAUTH_SECRET` without printing it. The job validates and generates Prisma Client, applies **only checked-in migrations** with `npm run db:deploy`, checks migration status, runs ESLint and `next typegen` plus TypeScript, runs all Vitest tests with `RUN_DATABASE_TESTS=1`, and builds the production bundle. A failure blocks that job; there is no deployment, database reset, or production credential in the workflow. Keep changes on a feature branch, open a pull request to `main`, review the CI result, and merge under the repository's branch policy. A remote GitHub run is still required to establish that the workflow succeeds on GitHub's runner.

The repository's `package-lock.json` makes `npm ci` deterministic for the checked-in dependency graph; `postinstall` and `prebuild` generate Prisma Client, and CI also runs generation explicitly. `next/font` currently fetches Google-hosted Geist assets during build, so a network-restricted build can still fail. The CI service and development Compose use the same PostgreSQL major/image but separate databases. Do not point `RUN_DATABASE_TESTS=1` at valuable data: most integration tests roll back their transactions, but the rate-limit concurrency test cleans up its own temporary bucket.

## Production environment and Vercel preparation

Deploy the repository as one Next.js App Router application using the framework preset, Node.js 24 LTS, `npm ci`, and `npm run build`; no application Dockerfile or `vercel.json` is needed for the current architecture. Verify these settings in Vercel before enabling production. `postinstall`/`prebuild` regenerate Prisma Client, and the generated Client is Git-ignored. The runtime needs Node.js (not an Edge-only database runtime) for `pg`, bcrypt, and Prisma. Static assets remain under `public/`; Next image handling and Geist font fetching need a live preview check. Do not hardcode a localhost URL in hosted settings.

Configure server-only production variables in the deployment secret store: `DATABASE_URL` for the hosted database, a unique long random `NEXTAUTH_SECRET`, and canonical HTTPS `NEXTAUTH_URL`. Set or verify `NODE_ENV=production` through the platform; do not use local `POSTGRES_*` Compose values or `ADMIN_*` development variables in production. `VERCEL` and `VERCEL_ENV` are platform-provided, not values to fake in production. `NEXTAUTH_SECRET` must stay stable across instances and deploys or sessions become invalid. Configure preview credentials and callback URLs separately, and verify the preview auth behavior before inviting testers. Never use `NEXT_PUBLIC_` for secrets.

Choose a hosted PostgreSQL provider and region with acceptable latency to the Vercel functions. Follow its TLS/certificate requirements for the URL, enable managed backups and test a restore before taking real enquiries. Confirm that its connection or transaction pooler is compatible with Prisma 7's `@prisma/adapter-pg` and migrations; use a suitable direct connection for migration jobs if the provider requires it. Account for the provider's connection ceiling across concurrent serverless instances, CI/release jobs, and operations. The present client reuses a connection pool only within one server instance, so provider and pool sizing need a load check. No provider, paid plan, region, pooling value, or retention period is selected here.

Task #13's rate limiter requires the `RateLimitBucket` table before traffic reaches the new application. Counters live in PostgreSQL and therefore work across local, CI, and serverless instances. On Vercel it trusts the edge-overwritten `x-vercel-forwarded-for` header; outside Vercel it uses one shared `unidentified` bucket rather than trusting caller-supplied IP headers. Verify the forwarded-header behavior and add a reviewed edge firewall/rate-limit policy in the actual deployment. If database access fails, login and enquiry fail closed; this is an availability dependency.

## Controlled production release sequence — proposed, not executed

1. Review migration SQL and its compatibility with the running app. Provision a managed PostgreSQL database, restrict access, configure TLS and backups, and confirm a restore path.
2. Configure production-only secrets and the canonical HTTPS URL in Vercel; choose Node.js 24 and the approved environment. Keep credentials out of source control and local development files.
3. In an approved release job with network access to the **production** database and Prisma CLI installed, apply checked-in migrations using `npm run db:deploy`; check `npx prisma migrate status`. Do not use `migrate dev`, `db push`, or reset. This workflow deliberately does **not** run production migrations because no production database is selected or authorized.
4. Deploy the application only after migration succeeds. Verify `/`, `/services`, `/contact`, `/admin/login`, and unauthenticated `/admin` redirect. Confirm TLS, secure cookies, response/cache headers, published-content visibility, and a rate-limited test without locking a real administrator. Confirm an authorized sign-in, sign-out, enquiry, and dashboard read using disposable or approved data.
5. Provision the first production ADMIN using an approved one-time, non-public CLI/release-job design. **No production provisioning mechanism is implemented yet; initial ADMIN creation blocks a usable private workspace.** The proposed script would refuse unless explicitly invoked in the production release context, require operator-provided name/email/password from temporary secrets, enforce the existing password policy and bcrypt cost, use a transaction to refuse when an ADMIN already exists, insert exactly one ADMIN, and print no secret or hash. Remove the temporary values after use. Review this design and a recovery procedure before implementing or running it. The current `admin:provision` and `admin:reset-password` commands remain development-only.
6. Observe errors, database connections, rate-limit behavior, and deployment health. A failed **application** release can be rolled back to a compatible prior build. A database migration is not automatically reversible: use a reviewed forward fix or restore plan based on a tested backup. Prefer backward-compatible migration phases where possible.

Before production traffic, resolve the pending lead visibility/status policy, retention/deletion policy, provider and region, backup/restore objectives, edge controls, complete CSP, production cache behavior, administrator bootstrap/recovery, and dependency advisories. Do not treat a green CI job as deployment approval.

## Future environments

The CI and controlled-release sections above describe planned production operations. Vercel and hosted PostgreSQL are not configured; no production migration, deployment, or ADMIN provisioning has occurred. HSTS is emitted only when `VERCEL_ENV=production`; verify it over HTTPS on the real domain. A different hosting platform needs a reviewed trusted-client-IP integration.

## Known limitations

Docker container health could not be inspected here, but Prisma migration status and a rollback-based credential test succeeded against local PostgreSQL. Real login/provisioning with a durable account were not verified. The public shell still uses Google-hosted Geist fonts at build time; an offline build may fail to fetch them even when the database setup is correct.

At this checkpoint, `npm audit` reports four high-severity advisories in the Prisma CLI dependency graph (`@prisma/config`, `deepmerge-ts`, `mysql2`, and `prisma`). Its suggested automatic fix would downgrade Prisma to 6.19.3, so no automatic fix was applied. Review a compatible upstream fix before production deployment.

A Task #13 `npm audit --omit=dev` attempt could not reach the npm audit endpoint from this environment. The earlier advisory report is historical, not a fresh clearance. Repeat the audit from a network-enabled environment and review compatible fixes before deployment.

Git still tracks 414 files under `.npm-cache` from earlier work even though `.gitignore` now excludes that path. Task #14 did not remove them; review a separate repository cleanup before release. No new cache files are needed by CI or the application.
