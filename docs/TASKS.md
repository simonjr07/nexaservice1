# Implementation task plan

TASK-003, the initial application shell, is complete. Authentication code for A01 is implemented with unit tests, but real PostgreSQL login and logout verification remains open. IDs are references for future work. A task is complete when its behavior is implemented, reviewed, and covered by appropriate checks.

| ID | Status | Deliverable |
| --- | --- | --- |
| TASK-003 | Complete | Responsive public shell and homepage; static Services, About, and Contact pages; public, data-free `/admin` visual shell and module placeholders; NexaService metadata. Authentication and server-side authorization must precede any protected dashboard functionality. |

**Database foundation checkpoint (2026-09-23):** F02 and F03 are in progress. Compose, environment example, Prisma configuration, six models, indexes, and an initial SQL migration are prepared. Docker/PostgreSQL was unavailable, so container health, connectivity, and migration application have not been verified. Do not mark F02 or F03 complete until those checks pass on a local database. No application feature task is completed by this checkpoint.

**Authentication checkpoint (2026-09-23):** A01 code, development provisioning command, and nine mocked authentication/authorization tests are in place. Keep A01 in progress until migration and provisioning run on local PostgreSQL and a real browser sign-in/sign-out and protected-route check pass. Sign-in rate limiting is also outstanding for production readiness.
Prisma subsequently connected to local PostgreSQL and reported the migration up to date; a tenth, rollback-based database credential test passed. Provisioning and a complete browser sign-in/sign-out with a real account remain unverified. Docker container health is still unavailable here.

**Lead-intake checkpoint (2026-09-23):** W02's public quote form, Server Action, validation, honeypot, and Prisma repository are implemented. Ten enquiry tests, including a rollback-based PostgreSQL test, pass. A later fictional browser submission received a success acknowledgement and its durable PostgreSQL row was verified as `NEW` and unassigned. W02 is complete for the development workflow. Deployment-grade rate limiting remains a production follow-up.

**Lead-management checkpoint (2026-09-23):** D01 lead list/search/filter, D02 detail/status/private notes, and M01 ADMIN assignment are implemented with server-side checks and rollback-based PostgreSQL coverage. Keep these tasks in progress until the public-enquiry-to-admin browser workflow is verified. The current STAFF policy shows all leads; all five statuses may be chosen from any current status. Review these policies before production. D03 assigned view/metrics remains planned.

**Service-management checkpoint (2026-09-23):** The Service portion of M02 is implemented: ADMIN create/edit/publish/unpublish, public published-only list/detail, enquiry preselection, and publication checks. Unit and rollback-based PostgreSQL tests cover the rules. Keep the Service portion in progress until the ADMIN browser workflow is verified. Testimonial management was planned at this checkpoint and is now implemented below. No Service hard deletion or published-slug redirects are implemented.

**Website-content checkpoint (2026-09-23):** The Testimonial portion of M02 and Website Settings portion of M03 are implemented: ADMIN create/edit/publish/unpublish for fictional sample testimonials, published-only homepage display, ADMIN singleton settings save, and public name/contact display with a safe missing-row fallback. Unit and rollback-based PostgreSQL tests cover the rules. Signed-in ADMIN browser verification remains open. Staff account management remains planned.

| ID | Phase and task | Depends on | Completion criteria |
| --- | --- | --- | --- |
| P01 | Resolve content, forms, lead visibility, status rules, and settings decisions | — | Decisions and acceptance criteria recorded. |
| F01 | Establish project conventions and environment examples | P01 | Commands, env names, and folder boundaries documented without secrets. |
| F02 | Add Docker local PostgreSQL and Prisma setup | F01 | Local/test databases start; migrations run reliably. |
| F03 | Implement entities and constraints | F02, P01 | Reviewed migration matches approved data model. |
| F04 | Build validation, repositories, business services, and error conventions | F03 | Server-only data access and validation covered by tests. |
| A01 (in progress) | Implement Auth.js staff sign-in and sessions | F03, P01 | Sign-in/out works against local PostgreSQL; public sign-up absent. Code and unit tests exist; live verification is pending. |
| A02 (in progress) | Implement server role and lead visibility policies | A01, F04, P01 | Current all-leads STAFF access and ADMIN-only assignment are server checked; final visibility policy needs review. |
| W01 | Build homepage, company, services, testimonials | F04, P01 | Public Services and sample Testimonials now read published records; final content remains pending. |
| W02 (complete) | Build contact/enquiry form and creation service | W01, F04 | Valid browser submission and database record verified; validation and abuse handling pass tests. |
| D01 (in progress) | Build dashboard shell and lead list/search/filter | A02, W02 | Protected list and filters work in database tests; browser verification pending. |
| D02 (in progress) | Build lead detail, status changes, and internal notes | D01 | Detail and mutations work in database tests; browser verification pending. |
| D03 | Build assigned view and relevant metrics | D02, P01 | Views use authorized scope and documented metric definitions. |
| M01 (in progress) | Build ADMIN assignment | D02, A02 | ADMIN/STAFF role checks and persistence pass tests; browser verification pending. |
| M02 (in progress) | Build ADMIN service and testimonial management | W01, A02 | Service and Testimonial code/tests are implemented; signed-in ADMIN browser verification remains. |
| M03 (Settings in progress; Staff planned) | Build ADMIN staff and selected settings management | A02, P01 | Singleton Settings code/tests are implemented; browser verification and staff management remain. |
| Q01 | Add unit, integration, and component coverage | F04 onward | Critical rules and UI states in Testing pass. |
| Q02 | Add Playwright workflow coverage | W02, D03, M01–M03 | Public-to-dashboard and permission flows pass. |
| R01 | Add GitHub Actions and deployment configuration | Q01, Q02 | CI passes and preview deployment is verified. |
| R02 | Production readiness and Vercel/hosted PostgreSQL release | R01 | Secrets, migrations, backup/restore, security, and smoke checks verified. |

Tasks can be split into smaller pull requests. Testing should grow alongside implementation. A change to approved scope or stack requires an explicit decision update.
