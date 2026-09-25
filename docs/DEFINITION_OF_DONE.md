NexaService Definition of Done

This checklist is for the fictional portfolio/demo release, not a real service business launch. Complete means the stated item has evidence; Pending means its completion condition is still open. Implemented code is not treated as hosted or end-to-end verification. See TASKS.md for the longer implementation history.

Application

Pending: Public site complete for release. Home, About, published Service list/detail, fictional Testimonials, and the demo enquiry form are implemented. Final representative content, a published Service browser review, and hosted verification remain open.

Pending: Admin dashboard complete. Lead, content, staff, and settings pages plus analytics are implemented, but an assigned-only Lead view and a controlled signed-in browser review remain open.

Pending: Authentication and authorization complete. Credentials login, logout, ACTIVE/DISABLED checks, server-side role checks, and tests exist. A complete real-browser sign-in/sign-out, STAFF/ADMIN denial, and disabled-session matrix is still pending.

Pending: PostgreSQL integration complete end to end. Local persistence and migrations work, and all three migrations are applied to Neon; no hosted application has connected to Neon.

Pending: Lead workflow complete. Public intake, search/filter, detail, status, notes, and ADMIN assignment have automated coverage. The complete public-to-protected browser journey and final STAFF visibility/status-transition policy remain open.

Pending: Content management complete. Service, Testimonial, Site Settings, and staff management are implemented and database-tested. Signed-in browser verification and final fictional content are pending.

Pending: Analytics complete. Database-backed metrics and UTC date logic are implemented and tested; the protected dashboard still needs a signed-in browser and hosted-data check.

Pending: Security hardening complete for public hosting. Server checks, Zod validation, rate limiting, safe errors, and baseline headers exist. Full CSP, edge abuse controls, dependency review, hosted cookies/cache, and demo-data retention/recovery still need review.

Pending: Accessibility and performance review complete. Responsive widths, labels, focus, skip link, and representative keyboard states received manual review. Full signed-in keyboard/role coverage, a formal accessibility audit, and hosted performance measurements remain open.

Engineering

Complete: Local automated tests passing: the documented database-enabled run passed 66 Vitest tests; re-run the gates for this branch before merge.

Complete: Remote CI has passed on main: GitHub Actions verified migrations, lint, types, database tests, and build. This documentation branch still needs its own PR/CI result.

Complete: Migrations checked in: initial schema, User account status, and rate-limit migrations are versioned.

Complete: Docker local development configured: compose.yaml defines one PostgreSQL service with a named volume, localhost port, and health check; local PostgreSQL tests have passed.

Complete: Documentation for current state complete: README, case study, architecture, database, interfaces, decisions, testing, security, deployment, screenshots plan, and this checklist describe implemented and pending work.

Complete: Credential-bearing environment files ignored. Files beginning with .env are ignored except the non-secret .env.example. No local or Neon connection value belongs in Git.

Complete: Production ADMIN tooling tested only on a disposable database: explicit bootstrap and recovery CLIs have guards, bcrypt checks, and database tests. Neither has run on Neon.

Pending: Current branch CI passing: requires a remote run after review and a permitted push/PR; local checks alone do not close this item.

Complete: Tracked npm cache cleanup verified. Git currently reports no tracked files under .npm-cache. Ignored local cache files may remain on disk.

Pending: Browser automation added: React Testing Library and Playwright are approved but not installed or run; they are planned quality work rather than existing evidence.

Deployment

Complete: Neon migrations complete: the three checked-in migrations were applied through a direct TLS connection and reported up to date. No production ADMIN or real enquiry data was created by that operation.

Pending: Hosting approval: written Vercel confirmation for this specific Hobby portfolio use is pending. If disallowed, select a compliant alternative with human approval; do not activate Pro automatically.

Pending: Live deployment: no Vercel project or deployed application exists.

Pending: Production ADMIN creation: the CLI is tested, but its one-time Neon execution requires separate explicit approval.

Pending: Hosted smoke testing: no hosted route, authentication, enquiry, header, performance, or database-runtime smoke test has run.

Pending: Demo-data lifecycle and restore procedure: retention/deletion and a safe restore test remain to be defined before public exposure. Genuine customer enquiry collection is not approved.

Portfolio proof

Complete: README complete for the current state: features, architecture, stack, local setup, evidence, and deployment limits are documented.

Complete: Case study complete for the current state: decisions, workflows, tradeoffs, debugging lessons, and future work are recorded in CASE_STUDY.md (CASE_STUDY.md).

Complete: Architecture proof complete. The README and ARCHITECTURE.md describe runtime and CI boundaries with Vercel marked pending.

Complete: Selected local screenshots cataloged in the case study. Ten manually captured images show the public site, blank enquiry form, staff login, dashboard, ADMIN content pages, and mobile layouts. CASE_STUDY.md lists their captions and file paths; these are not hosted verification.

Pending: Screenshot plan complete: a published Service listing/detail, safe fictional Lead inbox/detail and staff-account captures, mobile enquiry, and remaining states still need capture. See SCREENSHOTS.md (SCREENSHOTS.md).

Pending: Live demo URL: none exists until hosting approval, authorized deployment, ADMIN bootstrap, and hosted smoke tests are complete.

No completed item authorizes deployment, production ADMIN creation, real customer enquiries, a purchase, or a Git push.
