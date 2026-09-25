# NexaService Definition of Done

This checklist is for the **fictional portfolio/demo release**, not a real service business launch. `[x]` means the stated item has evidence; `[ ]` means its completion condition is still open. Implemented code is not treated as hosted or end-to-end verification. See [TASKS.md](TASKS.md) for the longer implementation history.

## Application

- [ ] **Public site complete for release.** Home, About, published Service list/detail, fictional Testimonials, and the demo enquiry form are implemented. Final representative content, a published Service browser review, and hosted verification remain open.
- [ ] **Admin dashboard complete.** Lead, content, staff, and settings pages plus analytics are implemented, but an assigned-only Lead view and a controlled signed-in browser review remain open.
- [ ] **Authentication and authorization complete.** Credentials login, logout, ACTIVE/DISABLED checks, server-side role checks, and tests exist. A complete real-browser sign-in/sign-out, STAFF/ADMIN denial, and disabled-session matrix is still pending.
- [ ] **PostgreSQL integration complete end to end.** Local persistence and migrations work, and all three migrations are applied to Neon; no hosted application has connected to Neon.
- [ ] **Lead workflow complete.** Public intake, search/filter, detail, status, notes, and ADMIN assignment have automated coverage. The complete public-to-protected browser journey and final STAFF visibility/status-transition policy remain open.
- [ ] **Content management complete.** Service, Testimonial, Site Settings, and staff management are implemented and database-tested. Signed-in browser verification and final fictional content are pending.
- [ ] **Analytics complete.** Database-backed metrics and UTC date logic are implemented and tested; the protected dashboard still needs a signed-in browser and hosted-data check.
- [ ] **Security hardening complete for public hosting.** Server checks, Zod validation, rate limiting, safe errors, and baseline headers exist. Full CSP, edge abuse controls, dependency review, hosted cookies/cache, and demo-data retention/recovery still need review.
- [ ] **Accessibility and performance review complete.** Responsive widths, labels, focus, skip link, and representative keyboard states received manual review. Full signed-in keyboard/role coverage, a formal accessibility audit, and hosted performance measurements remain open.

## Engineering

- [x] **Local automated tests passing:** the documented database-enabled run passed 66 Vitest tests; re-run the gates for this branch before merge.
- [x] **Remote CI has passed on `main`:** GitHub Actions verified migrations, lint, types, database tests, and build. This documentation branch still needs its own PR/CI result.
- [x] **Migrations checked in:** initial schema, User account status, and rate-limit migrations are versioned.
- [x] **Docker local development configured:** `compose.yaml` defines one PostgreSQL service with a named volume, localhost port, and health check; local PostgreSQL tests have passed.
- [x] **Documentation for current state complete:** README, case study, architecture, database, interfaces, decisions, testing, security, deployment, screenshots plan, and this checklist describe implemented and pending work.
- [x] **Credential-bearing environment files ignored:** `.env*` is ignored except the non-secret `.env.example`. No local or Neon connection value belongs in Git.
- [x] **Production ADMIN tooling tested only on a disposable database:** explicit bootstrap and recovery CLIs have guards, bcrypt checks, and database tests. Neither has run on Neon.
- [ ] **Current branch CI passing:** requires a remote run after review and a permitted push/PR; local checks alone do not close this item.
- [x] **Tracked npm cache cleanup verified in this branch's index:** all 414 old `.npm-cache` paths are staged for removal from Git tracking; `git ls-files -- '.npm-cache/**'` returns none. Ignored local cache files remain on disk. This change is not committed or merged, so `main` still needs the reviewed cleanup.
- [ ] **Browser automation added:** React Testing Library and Playwright are approved but not installed or run; they are planned quality work rather than existing evidence.

## Deployment

- [x] **Neon migrations complete:** the three checked-in migrations were applied through a direct TLS connection and reported up to date. No production ADMIN or real enquiry data was created by that operation.
- [ ] **Hosting approval:** written Vercel confirmation for this specific Hobby portfolio use is pending. If disallowed, select a compliant alternative with human approval; do not activate Pro automatically.
- [ ] **Live deployment:** no Vercel project or deployed application exists.
- [ ] **Production ADMIN creation:** the CLI is tested, but its one-time Neon execution requires separate explicit approval.
- [ ] **Hosted smoke testing:** no hosted route, authentication, enquiry, header, performance, or database-runtime smoke test has run.
- [ ] **Demo-data lifecycle and restore procedure:** retention/deletion and a safe restore test remain to be defined before public exposure. Genuine customer enquiry collection is not approved.

## Portfolio proof

- [x] **README complete for the current state:** features, architecture, stack, local setup, evidence, and deployment limits are documented.
- [x] **Case study complete for the current state:** decisions, workflows, tradeoffs, debugging lessons, and future work are recorded in [CASE_STUDY.md](CASE_STUDY.md).
- [x] **Architecture proof complete:** the README diagram and [ARCHITECTURE.md](ARCHITECTURE.md) show runtime and CI boundaries with Vercel marked pending.
- [ ] **Screenshots captured:** [SCREENSHOTS.md](SCREENSHOTS.md) is a capture plan only; no images have been fabricated or added.
- [ ] **Live demo URL:** none exists until hosting approval, authorized deployment, ADMIN bootstrap, and hosted smoke tests are complete.

No checked item authorizes deployment, production ADMIN creation, real customer enquiries, a purchase, or a Git push.
