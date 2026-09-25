Implementation task plan

TASK-003, the initial application shell, is complete. Authentication code for A01 is implemented with unit tests, but real PostgreSQL login and logout verification remains open. IDs are references for future work. A task is complete when its behavior is implemented, reviewed, and covered by appropriate checks.

TASK-003 — Complete. Responsive public shell and homepage; static Services, About, and Contact pages; public, data-free /admin visual shell and module placeholders; NexaService metadata. Authentication and server-side authorization must precede any protected dashboard functionality.

Database foundation checkpoint (2026-09-23): F02 and F03 are in progress. Compose, environment example, Prisma configuration, six models, indexes, and an initial SQL migration are prepared. Docker/PostgreSQL was unavailable, so container health, connectivity, and migration application have not been verified. Do not mark F02 or F03 complete until those checks pass on a local database. No application feature task is completed by this checkpoint.

Authentication checkpoint (2026-09-23): A01 code, development provisioning command, and nine mocked authentication/authorization tests are in place. Keep A01 in progress until migration and provisioning run on local PostgreSQL and a real browser sign-in/sign-out and protected-route check pass. Sign-in rate limiting is also outstanding for production readiness.
Prisma subsequently connected to local PostgreSQL and reported the migration up to date; a tenth, rollback-based database credential test passed. Provisioning and a complete browser sign-in/sign-out with a real account remain unverified. Docker container health is still unavailable here.

Lead-intake checkpoint (2026-09-23): W02's public quote form, Server Action, validation, honeypot, and Prisma repository are implemented. Ten enquiry tests, including a rollback-based PostgreSQL test, pass. A later fictional browser submission received a success acknowledgement and its durable PostgreSQL row was verified as NEW and unassigned. W02 is complete for the development workflow. Deployment-grade rate limiting remains a production follow-up.

Lead-management checkpoint (2026-09-23): D01 lead list/search/filter, D02 detail/status/private notes, and M01 ADMIN assignment are implemented with server-side checks and rollback-based PostgreSQL coverage. Keep these tasks in progress until the public-enquiry-to-admin browser workflow is verified. The current STAFF policy shows all leads; all five statuses may be chosen from any current status. Review these policies before production. D03 assigned view/metrics remains planned.

Service-management checkpoint (2026-09-23): The Service portion of M02 is implemented: ADMIN create/edit/publish/unpublish, public published-only list/detail, enquiry preselection, and publication checks. Unit and rollback-based PostgreSQL tests cover the rules. Keep the Service portion in progress until the ADMIN browser workflow is verified. Testimonial management was planned at this checkpoint and is now implemented below. No Service hard deletion or published-slug redirects are implemented.

Website-content checkpoint (2026-09-23): The Testimonial portion of M02 and Website Settings portion of M03 are implemented: ADMIN create/edit/publish/unpublish for fictional sample testimonials, published-only homepage display, ADMIN singleton settings save, and public name/contact display with a safe missing-row fallback. Unit and rollback-based PostgreSQL tests cover the rules. Signed-in ADMIN browser verification remains open. Staff account management remains planned.

Dashboard-analytics checkpoint (2026-09-23): Task #10's /admin overview now shows database-backed all-lead/status/current-UTC-month counts, five recent Leads, six UTC calendar months including zero months, and up to five Services by linked enquiry count including unpublished Services. STAFF and ADMIN may view it under the current all-leads policy. Unit and rollback-based PostgreSQL tests pass; signed-in browser verification remains open. D03's assigned-only view is still planned, so D03 as a whole remains in progress.

Staff-management checkpoint (2026-09-24): Task #11's ADMIN-only /admin/users list, creation, profile editing, and disable/reactivate controls are implemented. The User status migration defaults existing accounts to ACTIVE. Login and protected requests reject DISABLED accounts, assignment choices exclude them, and historical Lead/LeadNote relations remain intact. Self and last-active-ADMIN safeguards run inside serialized transactions. Unit and rollback-based PostgreSQL tests pass; signed-in browser verification remains open.

Frontend-polish checkpoint (2026-09-24): Task #12 preserves the existing public and workspace design while improving responsive record lists, active workspace navigation, mobile menu closing, login/form feedback, and public/protected loading, error, and service 404 states. No imagery was added because a specific service industry and authentic business assets have not been selected. Public and authenticated workspace routes were reviewed at 375, 768, 1024, and 1440 CSS pixels without page-level horizontal overflow. No database records were changed during browser review. A published Service detail page and an unauthenticated login form could not be visually reviewed because no Service is currently published and the available browser session was already signed in; their code and route responses were inspected.

Brand and UX checkpoint (2026-09-24): Task #12B approves the fictional commercial workplace/facility positioning. Public copy, an explicitly illustrative workplace image, matching brand/icon assets, social preview, enquiry feedback, and management empty/publication states are implemented. The Service catalogue remains database-driven; no Service records or business rules were changed. Public and authenticated workspace routes were reviewed at 375, 768, 1024, and 1440 CSS pixels without persistent page-level horizontal overflow. A published Service detail page and signed-out login screen remain unavailable for visual review in the current browser state.

Security-hardening checkpoint (2026-09-24): Task #13 adds atomic PostgreSQL request counters for credentials login and public enquiry, a safe enquiry throttle state, and baseline browser security headers. The additive migration was applied locally without changing business records. Unit and rollback-based database tests cover the limiter; production Vercel IP handling, cookies, cache headers, edge controls, and a full CSP require deployment verification. The established authorization, Zod validation, plain-text rendering, and request-scoped settings caching remain in place.

CI/deployment-preparation checkpoint (2026-09-24): Task #14 configures GitHub Actions CI for pull requests and pushes to main. It installs from the lockfile, validates/generates Prisma Client, applies checked-in migrations to an isolated PostgreSQL service, runs lint/type checks and all Vitest tests, and builds the app. Node.js 24 LTS is recorded in .nvmrc; release, hosted database, and first production ADMIN procedures are documented as proposed operations. No remote CI run or deployment has been verified, so R01/R02 remain in progress.

Production-release checkpoint (2026-09-25): Task #15 confirmed a remote main CI run passed every step and prepared a separate branch that removed 414 tracked npm-cache artifacts without deleting local cache files. That cleanup was later merged through Task #16. The Neon Free project nexaservice-demo was created in London; its direct endpoint was reached over TLS, and all three checked-in migrations were applied and verified up to date. Local lint, type checking, all 66 tests with database coverage, production build, and a local production-server route smoke check passed. The human requests Vercel Hobby for a non-commercial demo, but Vercel's broad commercial-use rule may conflict with the project's original client-attraction purpose; deployment awaits written provider confirmation. If Hobby is not permitted, evaluate another free host that permits commercial portfolios. Public enquiry copy identifies the fictional demo and asks visitors not to submit real details. Approved production ADMIN bootstrap/recovery CLIs passed tests on a disposable local database; neither ran on Neon. Demo-data retention, production ADMIN creation, Vercel project, and deployment remain open.

Portfolio-proof checkpoint (2026-09-25): Task #16 added a portfolio-focused README, engineering case study (CASE_STUDY.md), screenshot capture plan (SCREENSHOTS.md), Definition of Done (DEFINITION_OF_DONE.md), and an architecture description. Local lint, type checking, the standard Vitest run (55 passed, 11 database tests skipped), the database-enabled run (all 66 passed), and production build passed on that documentation branch. Screenshots were captured later; no live URL, production ADMIN, hosted smoke test, or deployment was created. The npm-cache cleanup was merged into main with Task #16. Written Hobby-use confirmation remains pending.

Screenshot documentation checkpoint (2026-09-25): Ten manually captured local screenshots are cataloged with captions and file paths in CASE_STUDY.md. Screens containing a full name or personal email were excluded and individually ignored by Git. Published Service detail, safe Lead inbox/detail, and other planned views remain open. The current documentation changes have not run remotely.

P01 — Resolve content, forms, lead visibility, status rules, and settings decisions. Depends on: none. Complete when decisions and acceptance criteria are recorded.

F01 — Establish project conventions and environment examples. Depends on: P01. Complete when commands, env names, and folder boundaries are documented without secrets.

F02 — Add Docker local PostgreSQL and Prisma setup. Depends on: F01. Complete when local/test databases start and migrations run reliably.

F03 — Implement entities and constraints. Depends on: F02, P01. Complete when the reviewed migration matches the approved data model.

F04 — Build validation, repositories, business services, and error conventions. Depends on: F03. Complete when server-only data access and validation are covered by tests.

A01 (in progress) — Implement Auth.js staff sign-in and sessions. Depends on: F03, P01. Complete when sign-in/out works against local PostgreSQL with no public sign-up. Code and unit tests exist; live verification is pending.

A02 (in progress) — Implement server role and lead visibility policies. Depends on: A01, F04, P01. Current all-leads STAFF access and ADMIN-only assignment are server checked; final visibility policy needs review.

W01 — Build homepage, company, services, and testimonials. Depends on: F04, P01. Public Services and sample Testimonials now read published records; final content remains pending.

W02 (complete) — Build contact/enquiry form and creation service. Depends on: W01, F04. Valid browser submission and database record were verified; validation and abuse handling pass tests.

D01 (in progress) — Build dashboard shell and lead list/search/filter. Depends on: A02, W02. Protected list and filters work in database tests; browser verification is pending.

D02 (in progress) — Build lead detail, status changes, and internal notes. Depends on: D01. Detail and mutations work in database tests; browser verification is pending.

D03 (metrics implemented; assigned view planned) — Build assigned view and relevant metrics. Depends on: D02, P01. Dashboard metrics use the current authorized all-leads scope and documented UTC/count definitions; assigned-only view and browser verification remain open.

M01 (in progress) — Build ADMIN assignment. Depends on: D02, A02. ADMIN/STAFF role checks and persistence pass tests; browser verification is pending.

M02 (in progress) — Build ADMIN service and testimonial management. Depends on: W01, A02. Service and Testimonial code/tests are implemented; signed-in ADMIN browser verification remains.

M03 (implemented; browser review pending) — Build ADMIN staff and selected settings management. Depends on: A02, P01. Singleton Settings and staff-account lifecycle code/tests are implemented; signed-in ADMIN browser verification remains.

Q01 — Add unit, integration, and component coverage. Depends on: F04 onward. Complete when critical rules and UI states in Testing pass.

Q02 — Add Playwright workflow coverage. Depends on: W02, D03, M01–M03. Complete when public-to-dashboard and permission flows pass.

R01 — Add GitHub Actions and deployment configuration. Depends on: Q01, Q02. Complete when CI passes and preview deployment is verified.

R02 — Production readiness and Vercel/hosted PostgreSQL release. Depends on: R01. Complete when secrets, migrations, backup/restore, security, and smoke checks are verified.

Tasks can be split into smaller pull requests. Testing should grow alongside implementation. A change to approved scope or stack requires an explicit decision update.
