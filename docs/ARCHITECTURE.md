# Architecture

## System overview and approved stack

NexaService is one Next.js App Router full-stack application. React and Tailwind CSS provide the UI; TypeScript is used across application code. Auth.js handles staff authentication, Zod validates inputs, React Hook Form supports forms, and server-side business logic uses Prisma to access PostgreSQL. Testing uses Vitest, React Testing Library, and Playwright. Docker supports local PostgreSQL, GitHub Actions runs CI, and Vercel plus hosted PostgreSQL is the production target. There is no separate Express backend.

## Public and private boundaries

- **Current shell exception:** `/admin` is temporarily a public, non-sensitive visual placeholder. It contains no customer data, metrics, or administrative operations. Authentication and server-side authorization must be implemented before adding protected dashboard functionality. The private dashboard rules below describe the intended implementation.
- Public routes render approved site content and accept contact/enquiry submissions. Public visitors have no account or access to leads, notes, assignments, and dashboard data.
- Dashboard routes require a verified staff session. Only ADMIN and STAFF exist as internal roles.
- Route/layout checks help navigation, but each private read and mutation independently checks identity, role, and resource scope on the server.
- Return minimal view data; never pass private fields into public pages or client bundles.

## Server-side business logic

Pages and components focus on rendering. Server Actions handle form-driven application mutations where appropriate. Route Handlers are reserved for explicit HTTP endpoints when useful. Both call shared validation, authorization, and business services. Prisma calls stay in a server-only data-access layer, not scattered across React components. Server Components may initiate reads through that layer.

## Authentication and authorization

Auth.js will establish staff sessions; public registration is absent. The server enforces ADMIN-only assignment and staff/content/settings management. The exact STAFF visibility rule for unassigned or other staff members' leads is pending. Every action and handler must re-check authorization even if its form was rendered on a protected page.

## Request flows

1. **Public enquiry:** browser form -> server Zod validation and abuse controls -> business service -> Prisma creates a Lead with `NEW` status and optional Service relation -> safe acknowledgement.
2. **Lead read:** dashboard request -> session and visibility check -> repository query with bounded search/filter -> minimal lead data -> view.
3. **Lead mutation:** Server Action -> session/role check -> Zod validation -> business rule check -> repository mutation -> safe result and refreshed view.
4. **Public content edit:** ADMIN action -> authorization and validation -> repository update -> refresh affected public view.

## Proposed application structure

This is a proposal, not an existing tree or final filename contract:

```text
src/app/(public)/          public pages
src/app/(auth)/            sign-in page
src/app/dashboard/         protected pages
src/app/api/               explicit Route Handlers only
src/features/              feature use cases, validation, UI
src/server/auth/           session and policy helpers
src/server/db/             Prisma client and repositories
src/components/            shared presentation components
prisma/                    future schema and migrations
tests/                     cross-feature tests
```

The installed Next.js App Router guide confirms `src/app`, route groups, `page.tsx`, and `route.ts` conventions. The exact folders may be refined during implementation without changing the approved architecture.
