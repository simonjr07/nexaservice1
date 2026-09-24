# NexaService

NexaService is a portfolio project for a fictional commercial workplace and facility services business: a public website and private staff workspace in one Next.js application. It aims to demonstrate practical full-stack engineering while remaining small enough to complete.

Visitors will browse services, company information, and testimonials, then contact the business or request a quote. Staff will work with leads in a private dashboard. Administrators will also manage staff and selected public content. Public visitors will not create accounts.

## Current status

The responsive public site and protected dashboard are implemented. Staff credentials authentication, role checks, login, logout, and a development-only first-administrator command are implemented in code. The public quote form at `/contact#request-quote` creates leads through server validation and Prisma; a fictional browser submission and durable PostgreSQL record were verified locally. The protected `/admin/leads` inbox lists and filters real leads; detail pages support status changes, private notes, and ADMIN-only assignment. `/admin` shows live enquiry counts, recent Leads, status distribution, six months of activity, and the most requested Services. ADMIN Service, Testimonial, Website Settings, and staff-account management are implemented. PostgreSQL transaction tests cover these workflows, while signed-in administrator browser verification remains open. CI is configured but awaits a remote run; production deployment remains planned.

The frontend retains its restrained visual design. Admin record lists use compact cards on narrower screens, with labelled fields and actions; public and protected route failures show generic retry states. Published Service and Testimonial content remains database-driven, and the portfolio site does not claim real customer endorsements.

The public copy now focuses on practical support for commercial workplaces. An illustrative, AI-generated workplace image appears on the About page and in the social preview; it does not depict a real NexaService location. The navigation mark, favicon, and Apple touch icon share one simple visual identity. No real clients, staff, offices, or performance claims are represented.

Task #13 adds shared PostgreSQL login and enquiry throttling, baseline security response headers, and a safe public wait state for limited enquiries. Apply the new additive migration before starting the hardened app. A GitHub Actions workflow now checks a clean PostgreSQL migration, code quality, database tests, and production build on pull requests and pushes to `main`; it does not deploy. Production edge controls, a full nonce-based CSP, and live deployment verification remain open.

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS, PostgreSQL, Prisma, Zod, Auth.js/NextAuth.js, and bcryptjs are in use. Vitest covers authentication, staff management, public enquiry intake, lead management, dashboard analytics, Service publication, Testimonial publication, and Website Settings. GitHub Actions CI is configured but has not run remotely yet. React Hook Form, React Testing Library, Playwright, Vercel, and hosted PostgreSQL remain planned.

## Local setup

After cloning, use Node.js 24 LTS (see `.nvmrc`) and run `npm ci`. Copy `.env.example` to an ignored `.env`; choose local PostgreSQL credentials, a matching `DATABASE_URL`, a long random `NEXTAUTH_SECRET`, and `NEXTAUTH_URL=http://localhost:3000`. Run `docker compose up -d db` and wait for **healthy** in `docker compose ps`. Run `npm run db:deploy` to apply the checked-in migrations to a fresh database, then `npm run db:generate`. Follow [development admin provisioning](docs/SECURITY.md#development-admin-provisioning) to create a local ADMIN; no default account exists. Start with `npm run dev`, which regenerates Prisma Client before `next dev`, and sign in at `/admin/login`. Stop PostgreSQL with `docker compose down` to keep its named volume. Use `npm run db:migrate -- --name change_name` only when authoring a new development migration.

Visitors can browse published Services at `/services`, open `/services/[slug]`, and request a quote with that Service preselected. They can also submit a general enquiry at `/contact#request-quote` without an account. A selected Service must be published when the enquiry is submitted. Run `$env:RUN_DATABASE_TESTS = '1'; npm test` in PowerShell to include rollback-based PostgreSQL tests.

Signed-in ADMIN and STAFF can open `/admin/leads`, search by name/email/company, filter by status or service, and view lead details. Both roles can change status and add internal notes; only ADMIN can assign or clear an assignee. The current workflow shows all leads to both roles and allows any of the five statuses to replace another; narrower visibility and transition rules need product review before production.

After the first local ADMIN is provisioned, an active ADMIN can use `/admin/users` to create ADMIN or STAFF accounts, edit name/email/role, and disable or reactivate accounts. New passwords are hashed; the management UI does not change existing passwords. Disabled accounts cannot sign in or use protected routes/actions, including with an already-issued JWT. Only active accounts can receive new Lead assignments. Historical assignments and notes remain attached to disabled accounts. Self-disablement and self-demotion are blocked.

Both roles can view `/admin` analytics for all stored Leads under that same visibility policy. Total and status cards count current Lead records; “Leads This Month” counts creation in the current UTC calendar month. The six-month activity view includes zero-count months. The Service ranking counts linked enquiries, including historical links to unpublished Services. These are operational enquiry counts, not revenue or confirmed sales. Signed-in browser verification of the dashboard remains open.

ADMIN can create drafts at `/admin/services/new`, edit existing Services, and publish or unpublish them at `/admin/services`. STAFF cannot access these pages or actions. Slugs are editable and unique; changing a published slug changes its URL without creating a redirect. Unpublishing preserves historical Leads and their Service association. No Services are seeded automatically.

ADMIN can manage fictional sample testimonials at `/admin/testimonials` and business name, email, phone, and address at `/admin/settings`. Published testimonials appear on the homepage with an explicit portfolio-example label; drafts stay private. Saved settings provide the public brand and contact details. When no settings row exists, the public site uses the NexaService name and omits contact details rather than showing invented information. Settings are created only through an ADMIN save. No testimonials or settings are seeded automatically.

Local checks: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. Set `RUN_DATABASE_TESTS=1` for the Vitest database suite (PowerShell: `$env:RUN_DATABASE_TESTS = '1'; npm test`). CI runs those checks against its own PostgreSQL service after `npm run db:deploy`; see [deployment and CI](docs/DEPLOYMENT.md). The workflow does not provision a production database or administrator.

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
