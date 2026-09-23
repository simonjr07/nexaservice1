# Development and deployment plan

## Current status

The local Docker Compose, Prisma, and staff authentication configuration are checked in. Docker is not callable here, so container health remains unverified. Prisma connected to local PostgreSQL on 2026-09-23 and reported the initial migration up to date; a transactional credential test passed. A full browser sign-in/sign-out with a provisioned account remains unverified. Production hosting, CI, and Vercel configuration are still planned.

## Local PostgreSQL setup

Prerequisites: Node.js and npm supported by the installed packages, Docker Desktop/Engine with Compose, and an available localhost port (5432 by default). `compose.yaml` runs only official `postgres:17`, publishes its port on `127.0.0.1`, stores data in the `postgres_data` named volume, and uses `pg_isready` as a health check. This is a local development database, not production hosting.

1. Copy `.env.example` to `.env` (PowerShell: `Copy-Item .env.example .env`). Edit `.env` with a **new local-only** `POSTGRES_PASSWORD`; keep `DATABASE_URL` consistent with the user, password, database, and port. URL-encode special password characters. Set `NEXTAUTH_SECRET` to a long random value (for example, generate one locally with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`) and `NEXTAUTH_URL=http://localhost:3000`. `.env` is Git-ignored; do not commit it.
2. Run `docker compose up -d db`.
3. Run `docker compose ps` and wait for `db` to report **healthy**. For a direct check in PowerShell, run `docker compose exec db sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'`.
4. Run `npm install`, then `npm run db:validate` and `npm run db:generate`. The install and build scripts also generate Prisma Client; validation/generation do not require a live database.
5. Run `npm run db:migrate` to apply the checked-in initial migration to the local database. For a later schema change, use `npm run db:migrate -- --name descriptive_change`. Run `npx prisma migrate status` to confirm migration state.
6. Supply your own local administrator name, email, and password and run the explicit [provisioning command](SECURITY.md#development-admin-provisioning). The command requires `NODE_ENV=development` and does not run automatically.
7. Run `npm run dev`. Visit `/admin/login` and verify sign-in, role-appropriate placeholders, sign-out, and that `/admin` redirects back to login after sign-out. The protected workspace checks the current `User` row on each request.

Stop the container with `docker compose down`; this keeps the named volume. Do **not** use `docker compose down -v` unless you intend to delete all local database data. Changing `POSTGRES_USER`, `POSTGRES_PASSWORD`, or `POSTGRES_DB` after the volume has been initialized does not update existing PostgreSQL credentials; plan such changes deliberately.

## Prisma configuration and commands

Prisma CLI, Client, and PostgreSQL adapter are on the compatible 7.10.0 stable line. At selection time, npm's `latest` tag pointed to Prisma 8.0.0-rc.15, a release candidate, so this project chose the supported stable line rather than a prerelease. Prisma 7.10 uses `prisma7.config.ts` for the connection URL and `prisma/schema.prisma` for the datasource provider and Client generator. The generated Client goes to ignored `src/generated/prisma`; imports belong in server code only. `src/server/db/client.ts` creates a single adapter-backed Client and requires `DATABASE_URL` at runtime. The checked-in SQL is at `prisma/migrations/20260923000000_initial/migration.sql`.

Useful commands: `npm run db:validate`, `npm run db:generate`, `npm run db:migrate`, `npx prisma migrate status`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`. Prisma 7 does not generate Client automatically after `migrate dev`; run `db:generate` after schema changes. Never use a reset command against data that must be retained.

## Development data

No seed data or administrator account is included. An explicit development-only administrator command is available after the migration; it uses locally supplied values and hashes the password. Future seed data should be clearly fictional, limited to non-sensitive demo content, and reproducible. Production administrator provisioning is still undecided; no public or hard-coded administrator password belongs in source control.

## Future environments

Use GitHub for review and GitHub Actions for lint, type checking, tests, migration verification, and build once CI is implemented. Deploy the single Next.js app to Vercel with a separately chosen hosted PostgreSQL provider. Production settings must include `DATABASE_URL`, a unique long random `NEXTAUTH_SECRET`, and the canonical `NEXTAUTH_URL`; keep them in hosted secret settings, never `NEXT_PUBLIC_` variables or repository files. Review and apply migrations as a controlled release step. Do not use the development administrator command in production. A deployment-compatible sign-in rate limiter, provider, region, backups, logging, and secret rotation remain pending decisions.

## Known limitations

Docker container health could not be inspected here, but Prisma migration status and a rollback-based credential test succeeded against local PostgreSQL. Real login/provisioning with a durable account were not verified. The public shell still uses Google-hosted Geist fonts at build time; an offline build may fail to fetch them even when the database setup is correct.

At this checkpoint, `npm audit` reports four high-severity advisories in the Prisma CLI dependency graph (`@prisma/config`, `deepmerge-ts`, `mysql2`, and `prisma`). Its suggested automatic fix would downgrade Prisma to 6.19.3, so no automatic fix was applied. Review a compatible upstream fix before production deployment.
