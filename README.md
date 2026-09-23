# NexaService

NexaService is a portfolio project for a fictional professional service business: a public website and private staff workspace in one Next.js application. It aims to demonstrate practical full-stack engineering while remaining small enough to complete.

Visitors will browse services, company information, and testimonials, then contact the business or request a quote. Staff will work with leads in a private dashboard. Administrators will also manage staff and selected public content. Public visitors will not create accounts.

## Current status

The responsive public site and dashboard shell are implemented. Staff credentials authentication, role checks, login, logout, and a development-only administrator command are implemented in code. The dashboard still contains placeholders and no live business data. Prisma connects to local PostgreSQL and reports the initial migration up to date; a rollback-based credential test passes. A full browser sign-in/sign-out with a provisioned account remains unverified. Lead submission, management tools, CI, and production deployment remain planned.

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS, PostgreSQL, Prisma, Zod, Auth.js/NextAuth.js, and bcryptjs are in use. Vitest covers the current authentication logic. React Hook Form, React Testing Library, Playwright, GitHub Actions, Vercel, and hosted PostgreSQL are planned for later work.

## Local setup

Run `npm install`, copy `.env.example` to an ignored `.env`, and set local PostgreSQL credentials, a matching `DATABASE_URL`, a long random `NEXTAUTH_SECRET`, and `NEXTAUTH_URL=http://localhost:3000`. Run `docker compose up -d db`, wait for a healthy database in `docker compose ps`, then run `npm run db:migrate` and `npm run db:generate`. Follow [development admin provisioning](docs/SECURITY.md#development-admin-provisioning) to create a local ADMIN; no default account exists. Start the app with `npm run dev` and sign in at `/admin/login`. Stop PostgreSQL with `docker compose down` to keep its named volume.

Current checks: `npm run lint`, `npx next typegen`, `npx tsc --noEmit`, `npm test`, and `npm run build`.

## Documentation

- [Product requirements](docs/PRODUCT_REQUIREMENTS.md): users, scope, stories, and acceptance criteria
- [Architecture](docs/ARCHITECTURE.md): boundaries, flows, and proposed structure
- [Database](docs/DATABASE.md): conceptual entities and constraints
- [Application interfaces](docs/API.md): operations and error conventions
- [Task plan](docs/TASKS.md): phases, dependencies, and completion checks
- [Architecture decisions](docs/DECISIONS.md): approved ADRs
- [Testing](docs/TESTING.md): current and planned coverage
- [Security](docs/SECURITY.md): security requirements
- [Deployment](docs/DEPLOYMENT.md): planned local and production workflow

The documentation distinguishes implemented code from features and infrastructure that still need verification.
