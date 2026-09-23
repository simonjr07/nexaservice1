# Architecture

## Current implementation checkpoint

The public site and responsive dashboard shell are implemented. The database foundation includes local PostgreSQL Compose configuration, Prisma 7.10.0 schema/configuration, an initial SQL migration, and one server-side Client module at `src/server/db/client.ts`. Prisma connects to local PostgreSQL and reports the migration up to date. Staff authentication and role checks are implemented in code; a transactional credential test passes, while a full browser login with a provisioned account is not yet verified. Lead submission and operational dashboard features are not implemented.

## System overview and approved stack

NexaService is one Next.js App Router full-stack application. React and Tailwind CSS provide the UI; TypeScript is used across application code. Auth.js handles staff authentication, Zod validates inputs, React Hook Form supports forms, and server-side business logic uses Prisma to access PostgreSQL. Testing uses Vitest, React Testing Library, and Playwright. Docker supports local PostgreSQL, GitHub Actions runs CI, and Vercel plus hosted PostgreSQL is the production target. There is no separate Express backend.

## Public and private boundaries

- `/admin` and its child placeholders now use a server-checked staff layout. `/admin/login` stays public. Placeholders contain no lead data, metrics, or administrative operations.
- Public routes render approved site content and accept contact/enquiry submissions. Public visitors have no account or access to leads, notes, assignments, and dashboard data.
- Dashboard routes require a verified staff session. Only ADMIN and STAFF exist as internal roles.
- Route/layout checks help navigation, but each private read and mutation independently checks identity, role, and resource scope on the server.
- Return minimal view data; never pass private fields into public pages or client bundles.

## Server-side business logic

Pages and components focus on rendering. Server Actions handle form-driven application mutations where appropriate. Route Handlers are reserved for explicit HTTP endpoints when useful. Both call shared validation, authorization, and business services. Prisma calls stay in a server-only data-access layer, not scattered across React components. Server Components may initiate reads through that layer.

The centralized Prisma module uses the PostgreSQL driver adapter required by Prisma 7 and reuses one Client instance during development hot reload. It reads `DATABASE_URL` only when imported at runtime; schema validation and Client generation do not connect to a database.

## Authentication and authorization

NextAuth.js 4.24.15 uses a credentials provider and the existing Prisma `User` table. Credentials are validated with Zod, email is trimmed/lowercased, and bcryptjs compares password hashes. Auth.js issues an eight-hour JWT session in its HTTP-only cookie. The JWT/session expose only user ID, name, email, and role; no password hash. `getServerSession` plus a fresh database lookup in `src/server/auth/authorization.ts` checks that the user still exists and uses the current role. The protected route group redirects visitors to `/admin/login`; ADMIN-only placeholder routes reject STAFF. Future business reads and mutations must call authorization helpers independently. No public registration exists. The exact STAFF lead visibility rule remains pending.

## Request flows

1. **Public enquiry:** browser form -> server Zod validation and abuse controls -> business service -> Prisma creates a Lead with `NEW` status and optional Service relation -> safe acknowledgement.
2. **Lead read:** dashboard request -> session and visibility check -> repository query with bounded search/filter -> minimal lead data -> view.
3. **Lead mutation:** Server Action -> session/role check -> Zod validation -> business rule check -> repository mutation -> safe result and refreshed view.
4. **Public content edit:** ADMIN action -> authorization and validation -> repository update -> refresh affected public view.

## Proposed application structure

Current relevant structure (future feature modules may be added as planned):

```text
src/app/(public)/                    public pages
src/app/admin/login/                public staff sign-in page
src/app/admin/(protected)/          authenticated workspace shell/placeholders
src/app/api/auth/[...nextauth]/     Auth.js HTTP handler
src/server/auth/                   credentials, session options, authorization
src/server/db/                     centralized Prisma client
src/components/dashboard/          dashboard UI and login/logout controls
scripts/provision-admin.ts         explicit development administrator creation
prisma/                            schema and migrations
tests/auth/                        current authentication tests
```

The App Router route group keeps the login page outside the protected layout without changing `/admin` URLs. The Auth.js handler is the only implemented HTTP endpoint.
