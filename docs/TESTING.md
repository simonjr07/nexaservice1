# Testing strategy

Vitest covers authentication and public lead intake. Component and browser suites remain planned.

## Unit tests — Vitest

Current `tests/auth` coverage checks valid credentials, incorrect and unknown credentials, email normalization, malformed input, minimal session output, visitor redirect, STAFF/ADMIN dashboard admission, STAFF denial of ADMIN access, and deleted-account denial. Run `npm test`. These default tests mock the database. Future pure rule tests should cover `NEW` on lead creation, status transitions once approved, filters, and metrics.

Current `tests/enquiry` unit/action coverage checks required and optional fields, normalization, malformed/oversized input, valid and invalid service IDs, unpublished service rejection, no authentication requirement, honeypot behavior, generic persistence errors, and a public response with no Lead fields.

## Integration tests — Vitest with PostgreSQL

Run `$env:RUN_DATABASE_TESTS = '1'; npm test` in PowerShell with a migrated local PostgreSQL database to include the credential integration test. It creates a random STAFF record inside a transaction, verifies actual Prisma lookup and bcrypt comparison, then rolls the transaction back. This passed against local PostgreSQL on 2026-09-23. An isolated test database lifecycle and a real Auth.js cookie/sign-out browser flow are still pending. Future integration tests should cover lead visibility, notes, assignment, and transactional changes.

The lead-intake integration test uses a PostgreSQL transaction to create published/unpublished Services and Leads, verifies `NEW` status, null assignment, optional service handling, and published-service restrictions, then rolls back all test records. This passed locally. A manual browser submission was attempted, but browser automation was blocked by automatic approval review before any fields were entered; the UI submission and durable record check remain unverified.

For the remaining manual check, start the app locally, submit a fictional enquiry at `/contact#request-quote` using a unique `example.test` email, and confirm the success message. Query that email in the local PostgreSQL `Lead` table and verify `status = NEW`, `assignedUserId IS NULL`, and the chosen `serviceId` (or null). Do not use real customer details for this check.

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
| Public content management | ADMIN edits appear as intended; STAFF writes denied. |
| Session boundary | Signed-out or expired sessions cannot read or mutate private data. |

CI should run lint, type checking, relevant tests, and a production build once scripts exist. Coverage targets and supported browsers are pending decisions.
