# NexaService

NexaService is a portfolio project for a fictional professional service business: a public website and private staff workspace in one Next.js application. It aims to demonstrate practical full-stack engineering while remaining small enough to complete.

Visitors will browse services, company information, and testimonials, then contact the business or request a quote. Staff will work with leads in a private dashboard. Administrators will also manage staff and selected public content. Public visitors will not create accounts.

## Current status

The responsive public site and protected dashboard are implemented. Staff credentials authentication, role checks, login, logout, and a development-only first-administrator command are implemented in code. The public quote form at `/contact#request-quote` creates leads through server validation and Prisma; a fictional browser submission and durable PostgreSQL record were verified locally. The protected `/admin/leads` inbox lists and filters real leads; detail pages support status changes, private notes, and ADMIN-only assignment. `/admin` shows live enquiry counts, recent Leads, status distribution, six months of activity, and the most requested Services. ADMIN Service, Testimonial, Website Settings, and staff-account management are implemented. PostgreSQL transaction tests cover these workflows, while signed-in administrator browser verification remains open. CI and production deployment remain planned.

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS, PostgreSQL, Prisma, Zod, Auth.js/NextAuth.js, and bcryptjs are in use. Vitest covers authentication, staff management, public enquiry intake, lead management, dashboard analytics, Service publication, Testimonial publication, and Website Settings. React Hook Form, React Testing Library, Playwright, GitHub Actions, Vercel, and hosted PostgreSQL are planned for later work.

## Local setup

Run `npm install`, copy `.env.example` to an ignored `.env`, and set local PostgreSQL credentials, a matching `DATABASE_URL`, a long random `NEXTAUTH_SECRET`, and `NEXTAUTH_URL=http://localhost:3000`. Run `docker compose up -d db`, wait for a healthy database in `docker compose ps`, then run `npm run db:migrate` and `npm run db:generate`. Follow [development admin provisioning](docs/SECURITY.md#development-admin-provisioning) to create a local ADMIN; no default account exists. Start the app with `npm run dev` and sign in at `/admin/login`. Stop PostgreSQL with `docker compose down` to keep its named volume.

Visitors can browse published Services at `/services`, open `/services/[slug]`, and request a quote with that Service preselected. They can also submit a general enquiry at `/contact#request-quote` without an account. A selected Service must be published when the enquiry is submitted. Run `$env:RUN_DATABASE_TESTS = '1'; npm test` in PowerShell to include rollback-based PostgreSQL tests.

Signed-in ADMIN and STAFF can open `/admin/leads`, search by name/email/company, filter by status or service, and view lead details. Both roles can change status and add internal notes; only ADMIN can assign or clear an assignee. The current workflow shows all leads to both roles and allows any of the five statuses to replace another; narrower visibility and transition rules need product review before production.

After the first local ADMIN is provisioned, an active ADMIN can use `/admin/users` to create ADMIN or STAFF accounts, edit name/email/role, and disable or reactivate accounts. New passwords are hashed; the management UI does not change existing passwords. Disabled accounts cannot sign in or use protected routes/actions, including with an already-issued JWT. Only active accounts can receive new Lead assignments. Historical assignments and notes remain attached to disabled accounts. Self-disablement and self-demotion are blocked.

Both roles can view `/admin` analytics for all stored Leads under that same visibility policy. Total and status cards count current Lead records; “Leads This Month” counts creation in the current UTC calendar month. The six-month activity view includes zero-count months. The Service ranking counts linked enquiries, including historical links to unpublished Services. These are operational enquiry counts, not revenue or confirmed sales. Signed-in browser verification of the dashboard remains open.

ADMIN can create drafts at `/admin/services/new`, edit existing Services, and publish or unpublish them at `/admin/services`. STAFF cannot access these pages or actions. Slugs are editable and unique; changing a published slug changes its URL without creating a redirect. Unpublishing preserves historical Leads and their Service association. No Services are seeded automatically.

ADMIN can manage fictional sample testimonials at `/admin/testimonials` and business name, email, phone, and address at `/admin/settings`. Published testimonials appear on the homepage with an explicit portfolio-example label; drafts stay private. Saved settings provide the public brand and contact details. When no settings row exists, the public site uses the NexaService name and omits contact details rather than showing invented information. Settings are created only through an ADMIN save. No testimonials or settings are seeded automatically.

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
