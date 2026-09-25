# Testing strategy

Vitest covers authentication, staff-account management, public lead intake, protected lead management, dashboard analytics, Service management/publication, Testimonial management/publication, and singleton Website Settings. Component and browser suites remain planned.

For frontend review, check public pages and `/admin/login` at approximately 375, 768, 1024, and 1440 CSS pixels. Check that the mobile menu, form controls, focus outlines, success/error feedback, and service 404 page remain usable without page-level horizontal overflow. With an authorized local session, review `/admin`, leads, services, testimonials, settings, and users at the same widths; record lists should become labelled cards below 1200 CSS pixels. The protected browser review requires a real session and must be reported separately from route or unit checks.

For the brand pass, confirm that `/favicon.ico`, `/icon.svg`, and `/apple-icon.png` load and match the navigation mark; inspect the public Open Graph image metadata, the About image crop and disclosure, and the enquiry form's first-invalid-field focus. Never submit real customer details during visual checks.

Task #13 security checks cover atomic rate-limit counters and expiry rollover in a rolled-back PostgreSQL transaction, generic Auth.js failure when limited, enquiry rejection before Lead creation, trusted-header selection, and baseline/HSTS header configuration. Manually inspect rendered response headers, public/private route boundaries, keyboard focus, form labels and announcements, image text alternatives, and reduced-motion behavior. These checks are an accessibility review, not a WCAG certification. Avoid exhausting the shared local login bucket while testing a real development administrator.

The shared focus outline was changed to a dark teal ring with a white separator so it remains distinguishable against light and dark backgrounds. A browser check confirmed the public skip link receives visible keyboard focus, and contact/settings controls expose labels. The full signed-out/staff role and disabled-session browser matrix still needs disposable accounts and a controlled test environment.

## Unit tests — Vitest

Current `tests/auth` coverage checks valid credentials, incorrect and unknown credentials, email normalization, malformed input, minimal session output, visitor redirect, STAFF/ADMIN dashboard admission, STAFF denial of ADMIN access, and deleted-account denial. Run `npm test`. These default tests mock the database. Future pure rule tests should cover approved status-transition rules and metrics.

Current `tests/enquiry` unit/action coverage checks required and optional fields, normalization, malformed/oversized input, valid and invalid service IDs, unpublished service rejection, no authentication requirement, honeypot behavior, generic persistence errors, and a public response with no Lead fields.

Current `tests/leads` workflow coverage checks authenticated list/detail access, visitor redirects before private queries, STAFF status and note actions, status/note validation, session-derived note authorship, STAFF assignment denial, ADMIN assignment, and generic mutation errors.

Current `tests/services` workflow coverage checks ADMIN create/edit/publish/unpublish, STAFF and visitor denial, required fields, slug normalization/conflicts, draft default, public listing/detail visibility, 404 for drafts, and quote links.

Current `tests/website-content` workflow coverage checks ADMIN Testimonial create/edit/publication, draft default, invalid content, STAFF/visitor denial, settings validation and ADMIN-only save, public fallback behavior, and published-only homepage content.

Current `tests/dashboard` unit coverage checks status/total counts, current-month boundaries, six chronological months and zero-month filling across a year transition, STAFF/ADMIN admission, unauthenticated denial before queries, and generic database errors. The dashboard is a protected server read; no new public interface is added.

Current `tests/staff` workflow coverage checks ADMIN creation, server-side STAFF/visitor denial, normalized/duplicate email, weak password and invalid role/status, bcrypt storage, edits without password changes, unknown users, and safe database errors. Auth tests check that DISABLED accounts fail sign-in and that an already-issued session fails the fresh database authorization check.

## Integration tests — Vitest with PostgreSQL

Run `$env:RUN_DATABASE_TESTS = '1'; npm test` in PowerShell with a migrated local PostgreSQL database to include the credential integration test. It creates a random STAFF record inside a transaction, verifies actual Prisma lookup and bcrypt comparison, then rolls the transaction back. This passed against local PostgreSQL on 2026-09-23. The production CLI test below uses its own disposable database; other integration tests still use rollback transactions. A real Auth.js cookie/sign-out browser flow is pending.

The production ADMIN CLI integration test is also enabled by `RUN_DATABASE_TESTS=1`. It requires a loopback PostgreSQL server and permission to create/drop a database. It creates a uniquely named disposable database, applies copies of the checked-in migration SQL, then exercises the actual bootstrap and recovery scripts in subprocesses with generated fictional credentials and `NODE_ENV=production`. It checks the explicit flags and environment guards, exactly one ACTIVE ADMIN, bcrypt cost 12, duplicate-bootstrap refusal, recovery for an existing ADMIN only, and preservation of every other User field. A `finally` cleanup drops only that generated test database. On restricted Windows hosts, a test-only preload works around Node's unavailable `os.userInfo()` for the `tsx` launcher; it is not part of production scripts.

The lead-intake integration test uses a PostgreSQL transaction to create published/unpublished Services and Leads, verifies `NEW` status, null assignment, optional service handling, and published-service restrictions, then rolls back all test records. This passed locally. On 2026-09-23, a fictional browser enquiry also received a success acknowledgement and its durable PostgreSQL row was verified with `NEW`, null assignee, and null service. Earlier browser automation was blocked before input, but this later check completed.

The lead-management integration test creates a public enquiry, staff accounts, and a Service within a PostgreSQL transaction. It verifies list filtering, detail, status update, private note author, STAFF assignment denial, ADMIN assignment, and persisted values before rolling back. It does not prove the full browser flow.

The Service integration test creates a draft inside a PostgreSQL transaction, publishes it, verifies public and enquiry eligibility, creates a Lead, unpublishes the Service, verifies new enquiry rejection and historical Lead association, then rolls the transaction back. It never edits existing development records.

The website-content integration test creates a Testimonial within a PostgreSQL transaction, verifies publication filtering and edits, then checks SiteSettings upsert at ID 1. It rolls back and verifies any preexisting settings row is unchanged. It does not leave development sample content behind.

The dashboard integration test creates six fictional Leads and an unpublished Service inside a PostgreSQL transaction. It checks count changes against a pre-transaction baseline, UTC month grouping, recent ordering/limit, and historical unpublished Service ranking, then rolls back and confirms the Service is absent. It leaves existing development records untouched.

The staff-management integration test creates a temporary ADMIN, STAFF, Lead, and LeadNote in one transaction. It verifies bcrypt hashing, duplicate rejection, disablement, active-only assignment eligibility, preserved assignment/authorship, reactivation, unchanged password on profile edit, and self/last-ADMIN safeguards before rolling back. It does not exercise the signed-in browser workflow.

To repeat the public manual check, start the app locally, submit a fictional enquiry at `/contact#request-quote` using a unique `example.test` email, and confirm the success message. Query that email in the local PostgreSQL `Lead` table and verify `status = NEW`, `assignedUserId IS NULL`, and the chosen `serviceId` (or null). Do not use real customer details for this check.

Then sign in as a provisioned development ADMIN, find that enquiry at `/admin/leads`, open it, update status, add a private note, assign a current staff account, and refresh. Confirm the status, note/author, and assignment persist. Sign out and verify that the list/detail redirect to login. Use only fictional data; the browser workflow has not yet been verified by the automated tests.

For a Service browser check, sign in as ADMIN, create a test draft at `/admin/services/new`, publish it, inspect `/services` and `/services/[slug]`, submit an enquiry from its quote link, then unpublish it. Confirm its public detail is 404, it disappears from public choices, and the historical Lead still shows its Service. Use a disposable development database or an explicitly approved cleanup plan; Service hard deletion is not offered.

For website content, sign in as ADMIN, create a fictional Testimonial draft, publish it, verify the labeled homepage section, edit it, and unpublish it. At `/admin/settings`, enter fictional business details, save, and verify the public header, footer, contact page, and metadata. Refresh to confirm persistence. Use a disposable development database or restore previously saved settings afterward; signed-in browser verification remains open until credentials are available to the human engineer.

For dashboard verification, sign in as a development ADMIN and compare `/admin` Total Leads with the unfiltered `/admin/leads` count. Submit a fictional public enquiry, refresh, and confirm Total, New, This Month, and Recent Leads change. Change its status to CONTACTED and confirm New decreases and Contacted increases. If linked to a Service, check the Service ranking. The signed-in browser sequence remains unverified until a local session is available; do not use real customer information.

For staff management, sign in as an existing ADMIN and create a fictional STAFF account at `/admin/users/new`. Sign in with that new account, verify ordinary dashboard access and denial at `/admin/users`, then return as ADMIN to disable it. Confirm sign-in and existing-session protected requests fail. Reactivate it and confirm sign-in works again. Use a disposable development database or a deliberate test-account retention plan; the browser sequence remains unverified without an existing ADMIN session.

## Component tests — React Testing Library

React Testing Library is not configured yet. Add login and quote form feedback/loading component tests when this layer is introduced. Component tests do not replace server validation or authorization tests.

## End-to-end tests — Playwright

Playwright is not configured yet. With an isolated test database, add real sign-in, sign-out, redirect, STAFF/ADMIN route, and visitor-denial browser coverage, then later public enquiry and management workflows.

## Critical workflow matrix

| Workflow | Checks |
| --- | --- |
| Public enquiry to lead | Validation, `NEW` status, optional service, no private response data. |
| Staff lead work | Authorized list/detail scope, search/filter, status change, private note. |
| Assignment | ADMIN allowed, STAFF denied, valid or cleared assignee. |
| Service management | ADMIN edits and publication appear publicly; drafts stay private; STAFF writes denied; historical Lead relation survives unpublication. |
| Website content | ADMIN-only Testimonial and Settings writes, draft publication filtering, singleton settings, safe public fallback. |
| Dashboard analytics | Authorized all-lead counts, UTC date boundaries, zero months, recent five, unpublished Service associations, safe empty/error states. |
| Staff account lifecycle | ADMIN-only creation/edit/status, bcrypt, immediate protected-access denial after disablement, last-ADMIN safeguards, active-only assignments, historical relationships. |
| Production ADMIN CLI | Explicit production/confirmation guards, one-time ACTIVE bootstrap, bcrypt policy, existing-account-only password recovery, disposable-database cleanup. |
| Session boundary | Signed-out or expired sessions cannot read or mutate private data. |

`.github/workflows/ci.yml` runs on pull requests to `main` and pushes to `main`. It uses Node.js 24 LTS, `npm ci`, a healthy isolated PostgreSQL service, Prisma validation/generation, `prisma migrate deploy` plus status, lint, `next typegen`/TypeScript, the full Vitest suite with `RUN_DATABASE_TESTS=1`, and a production build. The first remote `main` run passed all steps on 2026-09-24; Task #15's branch changes have no remote run yet. CI verifies checked-in migrations from a clean CI database without deploying anything. Locally, use `npm run typecheck` and set `RUN_DATABASE_TESTS=1` only when a migrated disposable or development database is available. Coverage targets and supported browsers are pending decisions.
