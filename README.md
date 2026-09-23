# NexaService

NexaService is a planned service-business website and secure internal operations dashboard. This portfolio project aims to demonstrate professional full-stack engineering for agency clients, direct business clients, and freelance work while remaining small enough to finish.

Visitors will browse services, company information, and testimonials, then contact the business or request a quote. Staff will work with leads in a private dashboard. Administrators will also manage staff and selected public content. Public visitors will not create accounts.

## Current status

**Planning and documentation.** The repository currently contains a Next.js starter. The product features, database, authentication, tests, and deployment workflow described in the docs are planned, not implemented.

## Planned stack

One Next.js App Router application using React, TypeScript, and Tailwind CSS; PostgreSQL with Prisma 7.10.0 and Docker Compose for local development. Zod, Auth.js, React Hook Form, Vitest, React Testing Library, Playwright, GitHub Actions, Vercel, and hosted PostgreSQL remain planned. Provider and operational details marked pending in the docs require a later decision.

## Local database quick start

Copy `.env.example` to `.env`, choose a new local-only password, and keep `DATABASE_URL` aligned with the Compose variables. Then run `docker compose up -d db`, wait for `docker compose ps` to show a healthy database, and run `npm run db:migrate`. See [Deployment](docs/DEPLOYMENT.md) for the full setup and shutdown procedure. Prisma Client can be regenerated with `npm run db:generate`; these commands are configured but migration application has not yet been verified in this environment.

## Documentation

- [Product requirements](docs/PRODUCT_REQUIREMENTS.md): users, scope, stories, and acceptance criteria
- [Architecture](docs/ARCHITECTURE.md): boundaries, flows, and proposed structure
- [Database](docs/DATABASE.md): conceptual entities and constraints
- [Application interfaces](docs/API.md): operations and error conventions
- [Task plan](docs/TASKS.md): phases, dependencies, and completion checks
- [Architecture decisions](docs/DECISIONS.md): approved ADRs
- [Testing](docs/TESTING.md): planned coverage
- [Security](docs/SECURITY.md): security requirements
- [Deployment](docs/DEPLOYMENT.md): planned local and production workflow

The current starter can be run with `npm run dev`. That command does not provide the planned product functionality.
