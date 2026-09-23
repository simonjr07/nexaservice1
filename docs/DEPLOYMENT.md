# Development and deployment plan

## Current status

The local Docker Compose and Prisma configuration is checked in. Docker is not installed or callable in the current execution environment, so container health, PostgreSQL connectivity, and migration application remain **unverified**. The initial SQL migration is present but unapplied. Production hosting, CI, and Vercel configuration are still planned.

## Local PostgreSQL setup

Prerequisites: Node.js and npm supported by the installed packages, Docker Desktop/Engine with Compose, and an available localhost port (5432 by default). `compose.yaml` runs only official `postgres:17`, publishes its port on `127.0.0.1`, stores data in the `postgres_data` named volume, and uses `pg_isready` as a health check. This is a local development database, not production hosting.

1. Copy `.env.example` to `.env` (PowerShell: `Copy-Item .env.example .env`). Edit `.env` with a **new local-only** `POSTGRES_PASSWORD`; keep `DATABASE_URL` consistent with the user, password, database, and port. URL-encode special password characters. `.env` is Git-ignored; do not commit it.
2. Run `docker compose up -d db`.
3. Run `docker compose ps` and wait for `db` to report **healthy**. For a direct check in PowerShell, run `docker compose exec db sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'`.
4. Run `npm install`, then `npm run db:validate` and `npm run db:generate`. The install and build scripts also generate Prisma Client; validation/generation do not require a live database.
5. Run `npm run db:migrate` to apply the checked-in initial migration to the local database. For a later schema change, use `npm run db:migrate -- --name descriptive_change`. Run `npx prisma migrate status` to confirm migration state.
6. Run `npm run dev` for the Next.js starter. The app does not query PostgreSQL yet.

Stop the container with `docker compose down`; this keeps the named volume. Do **not** use `docker compose down -v` unless you intend to delete all local database data. Changing `POSTGRES_USER`, `POSTGRES_PASSWORD`, or `POSTGRES_DB` after the volume has been initialized does not update existing PostgreSQL credentials; plan such changes deliberately.

## Prisma configuration and commands

Prisma CLI, Client, and PostgreSQL adapter are on the compatible 7.10.0 stable line. At selection time, npm's `latest` tag pointed to Prisma 8.0.0-rc.15, a release candidate, so this project chose the supported stable line rather than a prerelease. Prisma 7.10 uses `prisma7.config.ts` for the connection URL and `prisma/schema.prisma` for the datasource provider and Client generator. The generated Client goes to ignored `src/generated/prisma`; imports belong in server code only. `src/server/db/client.ts` creates a single adapter-backed Client and requires `DATABASE_URL` at runtime. The checked-in SQL is at `prisma/migrations/20260923000000_initial/migration.sql`.

Useful commands: `npm run db:validate`, `npm run db:generate`, `npm run db:migrate`, `npx prisma migrate status`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`. Prisma 7 does not generate Client automatically after `migrate dev`; run `db:generate` after schema changes. Never use a reset command against data that must be retained.

## Development data

No seed script or administrator account is included. Future seed data should be clearly fictional, limited to non-sensitive demo content, and reproducible. Initial administrator provisioning needs its own secure, approved design; no public or hard-coded administrator password belongs in source control.

## Future environments

Use GitHub for review and GitHub Actions for lint, type checking, tests, migration verification, and build once CI is implemented. Deploy the single Next.js app to Vercel with a separately chosen hosted PostgreSQL provider. Production credentials belong in secret stores, never `NEXT_PUBLIC_` variables or repository files. Review and apply migrations as a controlled release step. Provider, region, backups, logging, and secret rotation remain pending decisions.

## Known limitations

No container or database connection was available during this task. The Prisma migration could not be applied or inspected against a live database. The starter UI still uses Google-hosted Geist fonts at build time; an offline build may fail to fetch them even when the database setup is correct.

At this checkpoint, `npm audit` reports four high-severity advisories in the Prisma CLI dependency graph (`@prisma/config`, `deepmerge-ts`, `mysql2`, and `prisma`). Its suggested automatic fix would downgrade Prisma to 6.19.3, so no automatic fix was applied. Review a compatible upstream fix before production deployment.
