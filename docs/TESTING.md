# Testing strategy

Testing will be added during implementation. No test suite is claimed to exist today.

## Unit tests — Vitest

Test pure validation and business rules: `NEW` on lead creation, status values/transitions once approved, roles and permissions, optional service/assignee handling, search/filter parsing, and metric calculations. Keep these independent of rendering and the database.

## Integration tests — Vitest with PostgreSQL

Exercise server services and Prisma repositories against an isolated test database. Verify relations, constraints, authorization, lead visibility, notes, assignment, and transactional changes. The test database lifecycle is pending.

## Component tests — React Testing Library

Check accessible forms, validation feedback, loading/success/error states, filters, status controls, and role-sensitive navigation. Component tests do not replace server authorization tests.

## End-to-end tests — Playwright

Use seeded test data to cover public discovery, valid/invalid enquiry, staff sign-in and triage, note creation, administrator assignment and content management, and denied visitor/STAFF access. Run critical smoke flows in CI; broaden browser coverage as the interface stabilizes.

## Critical workflow matrix

| Workflow | Checks |
| --- | --- |
| Public enquiry to lead | Validation, `NEW` status, optional service, no private response data. |
| Staff lead work | Authorized list/detail scope, search/filter, status change, private note. |
| Assignment | ADMIN allowed, STAFF denied, valid or cleared assignee. |
| Public content management | ADMIN edits appear as intended; STAFF writes denied. |
| Session boundary | Signed-out or expired sessions cannot read or mutate private data. |

CI should run lint, type checking, relevant tests, and a production build once scripts exist. Coverage targets and supported browsers are pending decisions.
