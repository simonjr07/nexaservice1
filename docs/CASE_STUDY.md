NexaService engineering case study

Project and status

NexaService is a fictional commercial workplace and facility-services business used to demonstrate a complete public-to-operations workflow. A visitor can explore published content and submit a fictional demo enquiry. A signed-in team can triage the resulting Lead in a private workspace. The application is built and tested locally; the Neon Free demo schema is migrated. No hosted application, production ADMIN, real customer workflow, or live URL exists. Vercel Hobby remains blocked pending written confirmation for this specific portfolio use.

This case study describes code and verification that exist, then separates work that still needs a hosted environment or a product decision. The Definition of Done (DEFINITION_OF_DONE.md) is the current checklist.

Problem and goals

The model business needs two connected experiences: a credible public description of available work, and an internal process for turning enquiries into trackable Leads without exposing customer messages or staff notes. The engineering goal was to demonstrate the path end to end in a maintainable application, including validation, persistence, authorization, tests, and deployment preparation.

The core acceptance path is: public form → validated NEW Lead → protected inbox and detail → status/note updates → ADMIN assignment → operational counts. Public users never register. This initial portfolio launch asks for fictional data and promises no business follow-up; genuine client acquisition is a separate decision.

Scope choices

The project uses one Next.js full-stack application. That keeps routing, UI, server actions, authentication, and data access together while preserving clear internal boundaries. The public website includes Home, About, published Service list/detail, fictional example Testimonials, and a contact/quote form. STAFF can view and work with Leads and metrics; ADMIN additionally manages assignment, Services, Testimonials, Site Settings, and staff accounts.

Payments, scheduling, customer accounts, inventory, chat, multi-tenancy, and microservices were excluded. They would increase surface area without strengthening the principal enquiry-to-operations demonstration. Services and Testimonials have draft/publication states instead of a general CMS. The public Service catalogue has no automatic seed; a published detail screenshot requires an explicitly created fictional example.

Architecture decisions

Browser requests enter Next.js App Router. Pages and presentation components call feature-level business functions; Server Actions handle form mutations. Auth.js owns the credential HTTP endpoint. Business logic applies Zod validation and server-side permission checks before calling Prisma repositories. A centralized Prisma Client connects to PostgreSQL. Docker Compose runs local PostgreSQL; the approved Neon Free database has the same checked-in schema but is not yet used by a hosted application. GitHub Actions independently applies those migrations to a disposable PostgreSQL service and runs quality gates. Vercel is a planned, blocked hosting step, not part of the current runtime.

These choices follow ADR-001 through ADR-005 (DECISIONS.md): relational PostgreSQL, one Next.js application, TypeScript, server-side authorization, and Prisma. Separating the presentation, feature, and repository layers prevents UI code from becoming the security or persistence boundary. It also allows tests to exercise validation and business rules without rendering the entire site. The architecture document (ARCHITECTURE.md) contains the request flows; API.md (API.md) distinguishes Server Actions from the Auth.js handler.

Data model and workflow

The schema centers on User, Service, Lead, LeadNote, Testimonial, and singleton SiteSettings, plus a RateLimitBucket operational table. Leads may optionally reference a Service and an assigned User. Notes require a Lead and an author. User.email and Service.slug are unique; Lead status defaults to NEW, and new Services and Testimonials default to unpublished. Foreign keys restrict deletion so unpublishing a Service or disabling a User does not erase Lead history or note authorship. Lead and note indexes support recent, status-filtered, assigned, and service-filtered reads. DATABASE.md (DATABASE.md) records the fields, constraints, and remaining schema decisions.

The public form accepts name, email, and message, with optional phone, company, and Service. Server validation trims and bounds values, normalizes email, and rechecks that a selected Service is published before creating a NEW, unassigned Lead. Its response contains only a safe result state. The inbox uses bounded search and 50-row pages; detail pages show private notes only after a fresh staff check. STAFF and ADMIN can change status and add notes, while only ADMIN can assign an active user. The note author comes from the session, never a submitted ID. Historical Leads still show a Service after it is unpublished.

The dashboard performs database-backed aggregation: current-status counts, Leads created this UTC month, five recent Leads, six chronological months including zero-count months, and up to five Services ranked by linked enquiries. These are operational counts; they do not imply customers, revenue, or completed work.

Identity, security, and abuse resistance

Auth.js/NextAuth.js authenticates email and password against PostgreSQL Users. New passwords are stored as bcrypt hashes with cost 12. Sessions are eight-hour JWT cookies containing only ID, name, email, and role. Protected reads and mutations re-read the current User, so DISABLED accounts and changed roles take effect without waiting for cookie expiry. ADMIN-only service, testimonial, settings, staff, and assignment operations enforce permission on the server, including direct action calls. Staff creation and status changes use serialized transactions with safeguards against self-disablement and loss of the last active ADMIN.

Public input uses Zod on the server. The form has a honeypot, length limits, generic failure states, and client duplicate-click prevention. Login and enquiry attempts share atomic PostgreSQL rate-limit counters keyed with an HMAC rather than storing raw client IP addresses. Baseline browser security headers and an incremental CSP are configured. The full CSP, edge abuse controls, hosted cookie/cache inspection, demo-data retention policy, and a reviewed restore objective remain open. A visitor can still ignore the fictional-data instruction, so the hosted demo must be treated as potentially receiving personal data despite its copy. SECURITY.md (SECURITY.md) states the implemented controls and limits.

Accessibility and performance work

The site uses semantic page/navigation structure, labeled form controls, visible focus states, a keyboard-operable mobile menu, inline validation feedback, and responsive dashboard records. Public and workspace layouts were manually reviewed at approximately 375, 768, 1024, and 1440 CSS pixels; a public skip link and representative labels/focus states were checked. This is a practical review, not a WCAG certification. The service detail and full signed-in role matrix still need controlled browser verification.

For data access, the inbox bounds page size and search input, dashboard queries aggregate or select limited rows rather than loading every Lead, and public settings reads are request-cached. Public content edits use targeted revalidation. There is no published performance benchmark; hosted latency, pooled connections, cache headers, and Core Web Vitals remain to be measured after an approved deployment.

Verification and delivery workflow

Vitest covers authentication/authorization, enquiry intake, Lead work, Service and Testimonial publication, Site Settings, staff lifecycle, analytics, and rate limiting. PostgreSQL integration tests use rollbacks or a uniquely named disposable database for production ADMIN CLI testing. The last documented database-enabled local run passed 66 tests. Component tests with React Testing Library and browser end-to-end tests with Playwright are still planned; a passing unit suite does not prove the entire signed-in browser workflow. TESTING.md (TESTING.md) gives the exact matrix and manual gaps.

GitHub Actions runs on pull requests to and pushes to main. It installs locked dependencies on Node.js 24, starts an isolated PostgreSQL service, validates/generates Prisma Client, applies checked-in migrations, checks migration status, runs lint and type checking, runs database-enabled Vitest, and builds the app. A remote main run passed; this documentation branch requires its own CI result before merge. The workflow has read-only repository permission, no Neon credentials, and no deploy step. The task log (TASKS.md) and deployment plan (DEPLOYMENT.md) distinguish those checks from a release.

Difficult problems and debugging lessons

Prisma 7 and reproducible startup: The PostgreSQL adapter and generated Client need coordinated configuration. Adding predev and prebuild generation prevents a stale Client from silently lagging behind schema changes. Checked-in SQL migrations are tested against a clean CI database instead of relying on a developer's existing volume.

Credentials without diagnostic leakage: A generic browser 401 cannot distinguish an input mismatch from a database or code failure. Temporary stage/boolean-only diagnostics helped investigate development sign-in without logging a password, hash, email, or connection string. The permanent callback still returns a generic failure and logs only safe fixed messages.

Historical data versus publication: Public queries must exclude unpublished Services and Testimonials, while protected historical Lead views must keep their associations. This led to server-side publication checks and restrictive foreign keys rather than hard deletion.

Shared abuse limits without another service: PostgreSQL counters work across application instances and avoid adding Redis. The tradeoff is that database failure makes login and enquiry fail closed, and deployment-edge protection is still needed for distributed abuse.

Safe release configuration: Next.js automatically loads .env.production.local during local production-mode commands. The ignored Neon URL was moved to .env.neon.local, which is not auto-loaded; migrations use a direct TLS connection only during an explicitly approved operation. This reduced the chance that an ordinary local build would query the hosted demo database.

Tradeoffs and next version

The current STAFF policy allows all Leads and the status picker allows any of the five statuses to replace another. Both choices keep the first workflow small but need a product decision for a real organization. Case-insensitive staff email uniqueness is enforced in application writes rather than by a database-wide normalized unique index. The database limiter has an unidentified shared bucket outside the trusted Vercel header path. Neon Free is appropriate only for disposable fictional demo data under the approved trial constraints; a real enquiry channel needs stronger retention, backup, and recovery decisions.

For a commercial version, I would first settle lead visibility and transitions, add a real privacy/retention and deletion process, verify restore and database connection behavior, review dependencies and edge controls, finish a tested CSP, and add Playwright coverage for sign-in, role denial, public enquiry, and protected mutations. I would then measure accessibility and performance on the actual host, set availability objectives, and implement an approved client-acquisition path separately. None of these improvements is claimed as complete here.

Evidence index

Product requirements (PRODUCT_REQUIREMENTS.md)
Evidence: Problem, users, stories, scope and non-goals

Architecture (ARCHITECTURE.md)
Evidence: Boundaries, authentication and request flows

Database (DATABASE.md)
Evidence: Model, constraints, indexes and migration status

Interfaces (API.md)
Evidence: Public/private operations and validation

Tasks (TASKS.md)
Evidence: Implementation checkpoints and unfinished work

Decisions (DECISIONS.md)
Evidence: Approved architectural and launch choices

Testing (TESTING.md)
Evidence: Automated coverage and browser gaps

Security (SECURITY.md)
Evidence: Controls and remaining risks

Deployment (DEPLOYMENT.md)
Evidence: Neon preparation, release gate and rollback

Selected interface evidence

These local development captures were made on 25 September 2026. They show interface states, not a hosted release or proof of a complete browser workflow. The screenshot plan (SCREENSHOTS.md) tracks captures still needed.

Public experience

Screenshot: Homepage section explaining the fictional service approach
Image file: docs/Images/homepage-why-nexaservice.png

The homepage explains the workplace-services concept with a clear visual hierarchy.

Service discovery

Screenshot: Public services page with navigation and fictional-demo disclosure
Image file: docs/Images/services-page-intro.png

The services route keeps public navigation and the fictional-demo disclosure visible. A published Service listing and detail capture are still needed.

Lead intake

Screenshot: Blank public enquiry form with required fields and fictional-data notice
Image file: docs/Images/contact-demo-enquiry-form.png

The quote form distinguishes required and optional fields and asks visitors to use fictional details.

Staff authentication

Screenshot: Staff sign-in page with blank email and password controls
Image file: docs/Images/staff-login.png

The separate staff entry point shows labeled credential fields and a password-visibility control; no credentials are displayed.

Dashboard analytics

Screenshot: Authenticated dashboard overview with lead counts
Image file: docs/Images/dashboard-lead-summary.png

The dashboard summarizes stored demo Leads by status and current UTC month, without implying revenue or customers.

Screenshot: Dashboard activity and service-ranking panels
Image file: docs/Images/dashboard-activity-service-ranking.png

The activity panel shows monthly enquiry counts, while the ranking retains historical links to an unpublished Service.

Admin content management

Screenshot: Service management table showing an unpublished draft
Image file: docs/Images/admin-service-management-draft.png

An ADMIN can review a Service draft and reach its edit and publication controls.

Screenshot: Testimonial management table showing a fictional draft
Image file: docs/Images/admin-testimonial-management-draft.png

Fictional testimonial examples stay in draft until an ADMIN publishes them.

Responsive experience

Screenshot: Mobile homepage with fictional-demo disclosure and quote call to action
Image file: docs/Images/mobile-homepage-hero.png

The narrow public layout keeps the demo disclosure and primary actions readable.

Screenshot: Mobile dashboard overview with compact navigation and lead counts
Image file: docs/Images/mobile-dashboard-overview.png

The workspace navigation and lead summary adapt to a narrow viewport.

The captured Lead inbox and staff-account screens display personal identifiers and are intentionally omitted. A fictional-data Lead inbox, Lead detail, published Service, and mobile enquiry capture remain open; screenshots do not replace the tests in TESTING.md (TESTING.md).
