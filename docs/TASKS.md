# Implementation task plan

TASK-003, the initial application shell, is complete. Authentication code for A01 is implemented with unit tests, but real PostgreSQL login and logout verification remains open. IDs are references for future work. A task is complete when its behavior is implemented, reviewed, and covered by appropriate checks.

| ID | Status | Deliverable |
| --- | --- | --- |
| TASK-003 | Complete | Responsive public shell and homepage; static Services, About, and Contact pages; public, data-free `/admin` visual shell and module placeholders; NexaService metadata. Authentication and server-side authorization must precede any protected dashboard functionality. |

**Database foundation checkpoint (2026-09-23):** F02 and F03 are in progress. Compose, environment example, Prisma configuration, six models, indexes, and an initial SQL migration are prepared. Docker/PostgreSQL was unavailable, so container health, connectivity, and migration application have not been verified. Do not mark F02 or F03 complete until those checks pass on a local database. No application feature task is completed by this checkpoint.

**Authentication checkpoint (2026-09-23):** A01 code, development provisioning command, and nine mocked authentication/authorization tests are in place. Keep A01 in progress until migration and provisioning run on local PostgreSQL and a real browser sign-in/sign-out and protected-route check pass. Sign-in rate limiting is also outstanding for production readiness.
Prisma subsequently connected to local PostgreSQL and reported the migration up to date; a tenth, rollback-based database credential test passed. Provisioning and a complete browser sign-in/sign-out with a real account remain unverified. Docker container health is still unavailable here.

**Lead-intake checkpoint (2026-09-23):** W02's public quote form, Server Action, validation, honeypot, and Prisma repository are implemented. Ten new enquiry tests, including a rollback-based PostgreSQL test, pass. A manual browser submission and durable-record check remain unverified because automatic browser approval review blocked input. Keep W02 in progress until that check passes. Deployment-grade rate limiting remains a production follow-up.

| ID | Phase and task | Depends on | Completion criteria |
| --- | --- | --- | --- |
| P01 | Resolve content, forms, lead visibility, status rules, and settings decisions | — | Decisions and acceptance criteria recorded. |
| F01 | Establish project conventions and environment examples | P01 | Commands, env names, and folder boundaries documented without secrets. |
| F02 | Add Docker local PostgreSQL and Prisma setup | F01 | Local/test databases start; migrations run reliably. |
| F03 | Implement entities and constraints | F02, P01 | Reviewed migration matches approved data model. |
| F04 | Build validation, repositories, business services, and error conventions | F03 | Server-only data access and validation covered by tests. |
| A01 (in progress) | Implement Auth.js staff sign-in and sessions | F03, P01 | Sign-in/out works against local PostgreSQL; public sign-up absent. Code and unit tests exist; live verification is pending. |
| A02 | Implement server role and lead visibility policies | A01, F04, P01 | Unauthorized reads and writes fail in integration tests. |
| W01 | Build homepage, company, services, testimonials | F04, P01 | Public content renders responsively and accessibly. |
| W02 (in progress) | Build contact/enquiry form and creation service | W01, F04 | Valid submission creates `NEW` lead; invalid/abusive input handled. Code and database test pass; manual UI verification is pending. |
| D01 | Build dashboard shell and lead list/search/filter | A02, W02 | Authorized users see permitted leads and navigate details. |
| D02 | Build lead detail, status changes, and internal notes | D01 | Changes persist, notes stay private, access enforced. |
| D03 | Build assigned view and relevant metrics | D02, P01 | Views use authorized scope and documented metric definitions. |
| M01 | Build ADMIN assignment | D02, A02 | ADMIN can assign/clear; STAFF denied. |
| M02 | Build ADMIN service and testimonial management | W01, A02 | Authorized edits appear publicly; STAFF denied. |
| M03 | Build ADMIN staff and selected settings management | A02, P01 | Approved provisioning and settings rules work. |
| Q01 | Add unit, integration, and component coverage | F04 onward | Critical rules and UI states in Testing pass. |
| Q02 | Add Playwright workflow coverage | W02, D03, M01–M03 | Public-to-dashboard and permission flows pass. |
| R01 | Add GitHub Actions and deployment configuration | Q01, Q02 | CI passes and preview deployment is verified. |
| R02 | Production readiness and Vercel/hosted PostgreSQL release | R01 | Secrets, migrations, backup/restore, security, and smoke checks verified. |

Tasks can be split into smaller pull requests. Testing should grow alongside implementation. A change to approved scope or stack requires an explicit decision update.
