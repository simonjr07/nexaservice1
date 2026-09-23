# Testing strategy

Vitest covers authentication, public lead intake, protected lead management, dashboard analytics, Service management/publication, Testimonial management/publication, and singleton Website Settings. Component and browser suites remain planned.

## Unit tests — Vitest

Current `tests/auth` coverage checks valid credentials, incorrect and unknown credentials, email normalization, malformed input, minimal session output, visitor redirect, STAFF/ADMIN dashboard admission, STAFF denial of ADMIN access, and deleted-account denial. Run `npm test`. These default tests mock the database. Future pure rule tests should cover approved status-transition rules and metrics.

Current `tests/enquiry` unit/action coverage checks required and optional fields, normalization, malformed/oversized input, valid and invalid service IDs, unpublished service rejection, no authentication requirement, honeypot behavior, generic persistence errors, and a public response with no Lead fields.

Current `tests/leads` workflow coverage checks authenticated list/detail access, visitor redirects before private queries, STAFF status and note actions, status/note validation, session-derived note authorship, STAFF assignment denial, ADMIN assignment, and generic mutation errors.

Current `tests/services` workflow coverage checks ADMIN create/edit/publish/unpublish, STAFF and visitor denial, required fields, slug normalization/conflicts, draft default, public listing/detail visibility, 404 for drafts, and quote links.

Current `tests/website-content` workflow coverage checks ADMIN Testimonial create/edit/publication, draft default, invalid content, STAFF/visitor denial, settings validation and ADMIN-only save, public fallback behavior, and published-only homepage content.

Current `tests/dashboard` unit coverage checks status/total counts, current-month boundaries, six chronological months and zero-month filling across a year transition, STAFF/ADMIN admission, unauthenticated denial before queries, and generic database errors. The dashboard is a protected server read; no new public interface is added.

## Integration tests — Vitest with PostgreSQL

Run `$env:RUN_DATABASE_TESTS = '1'; npm test` in PowerShell with a migrated local PostgreSQL database to include the credential integration test. It creates a random STAFF record inside a transaction, verifies actual Prisma lookup and bcrypt comparison, then rolls the transaction back. This passed against local PostgreSQL on 2026-09-23. An isolated test database lifecycle and a real Auth.js cookie/sign-out browser flow are still pending. Future integration tests should cover lead visibility, notes, assignment, and transactional changes.

The lead-intake integration test uses a PostgreSQL transaction to create published/unpublished Services and Leads, verifies `NEW` status, null assignment, optional service handling, and published-service restrictions, then rolls back all test records. This passed locally. On 2026-09-23, a fictional browser enquiry also received a success acknowledgement and its durable PostgreSQL row was verified with `NEW`, null assignee, and null service. Earlier browser automation was blocked before input, but this later check completed.

The lead-management integration test creates a public enquiry, staff accounts, and a Service within a PostgreSQL transaction. It verifies list filtering, detail, status update, private note author, STAFF assignment denial, ADMIN assignment, and persisted values before rolling back. It does not prove the full browser flow.

The Service integration test creates a draft inside a PostgreSQL transaction, publishes it, verifies public and enquiry eligibility, creates a Lead, unpublishes the Service, verifies new enquiry rejection and historical Lead association, then rolls the transaction back. It never edits existing development records.

The website-content integration test creates a Testimonial within a PostgreSQL transaction, verifies publication filtering and edits, then checks SiteSettings upsert at ID 1. It rolls back and verifies any preexisting settings row is unchanged. It does not leave development sample content behind.

The dashboard integration test creates six fictional Leads and an unpublished Service inside a PostgreSQL transaction. It checks count changes against a pre-transaction baseline, UTC month grouping, recent ordering/limit, and historical unpublished Service ranking, then rolls back and confirms the Service is absent. It leaves existing development records untouched.

To repeat the public manual check, start the app locally, submit a fictional enquiry at `/contact#request-quote` using a unique `example.test` email, and confirm the success message. Query that email in the local PostgreSQL `Lead` table and verify `status = NEW`, `assignedUserId IS NULL`, and the chosen `serviceId` (or null). Do not use real customer details for this check.

Then sign in as a provisioned development ADMIN, find that enquiry at `/admin/leads`, open it, update status, add a private note, assign a current staff account, and refresh. Confirm the status, note/author, and assignment persist. Sign out and verify that the list/detail redirect to login. Use only fictional data; the browser workflow has not yet been verified by the automated tests.

For a Service browser check, sign in as ADMIN, create a test draft at `/admin/services/new`, publish it, inspect `/services` and `/services/[slug]`, submit an enquiry from its quote link, then unpublish it. Confirm its public detail is 404, it disappears from public choices, and the historical Lead still shows its Service. Use a disposable development database or an explicitly approved cleanup plan; Service hard deletion is not offered.

For website content, sign in as ADMIN, create a fictional Testimonial draft, publish it, verify the labeled homepage section, edit it, and unpublish it. At `/admin/settings`, enter fictional business details, save, and verify the public header, footer, contact page, and metadata. Refresh to confirm persistence. Use a disposable development database or restore previously saved settings afterward; signed-in browser verification remains open until credentials are available to the human engineer.

For dashboard verification, sign in as a development ADMIN and compare `/admin` Total Leads with the unfiltered `/admin/leads` count. Submit a fictional public enquiry, refresh, and confirm Total, New, This Month, and Recent Leads change. Change its status to CONTACTED and confirm New decreases and Contacted increases. If linked to a Service, check the Service ranking. The signed-in browser sequence remains unverified until a local session is available; do not use real customer information.

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
| Session boundary | Signed-out or expired sessions cannot read or mutate private data. |

CI should run lint, type checking, relevant tests, and a production build once scripts exist. Coverage targets and supported browsers are pending decisions.
