# Deployment plan

This is a planned workflow. Docker, CI, production database provisioning, and deployment are not yet implemented.

## Local development

The current repository is a Next.js starter with `npm run dev`, `npm run build`, and `npm run lint`. Future setup will document Node/npm versions, ignored environment values, database startup, migrations/seeding, and test commands. Do not assume those commands exist today.

## Docker and PostgreSQL

Use Docker for local PostgreSQL, with development persistence and a separate disposable test database or equivalent isolation. Keep credentials out of version control. Document startup, migration, reset, and backup/restore steps when the database is added.

## GitHub and GitHub Actions

Use GitHub for source control and pull-request review. Planned CI checks are dependency install, lint, TypeScript check, unit/component/integration tests, relevant Playwright smoke tests, and production build. CI database service and caching choices remain pending. Keep secrets out of workflow logs and repository files.

## Vercel and hosted PostgreSQL

Deploy the single Next.js application to Vercel with hosted PostgreSQL. Choose the provider, region, connection strategy, and plan after reviewing Prisma/Vercel compatibility and expected usage. Run reviewed migrations as a controlled release step, not during page requests. Verify preview deployments before production promotion and monitor errors after release.

## Environment variables

Plan for a server-only database connection URL and Auth.js secret/configuration values. Exact names depend on the later setup. Keep development, test, preview, and production values separate. Store local values in ignored files and hosted values in Vercel/GitHub secret stores as appropriate. Never expose database credentials with `NEXT_PUBLIC_` variables.

## Pending operational decisions

Hosted PostgreSQL provider and region; domain; environment separation; migration command and ownership; backup/restore targets; logging/monitoring; and secret rotation.
