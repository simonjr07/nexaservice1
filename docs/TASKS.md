# Implementation task plan

All tasks below are planned, not completed by this documentation pass. IDs are references for future work. A task is complete when its behavior is implemented, reviewed, and covered by appropriate checks.

| ID | Phase and task | Depends on | Completion criteria |
| --- | --- | --- | --- |
| P01 | Resolve content, forms, lead visibility, status rules, and settings decisions | — | Decisions and acceptance criteria recorded. |
| F01 | Establish project conventions and environment examples | P01 | Commands, env names, and folder boundaries documented without secrets. |
| F02 | Add Docker local PostgreSQL and Prisma setup | F01 | Local/test databases start; migrations run reliably. |
| F03 | Implement entities and constraints | F02, P01 | Reviewed migration matches approved data model. |
| F04 | Build validation, repositories, business services, and error conventions | F03 | Server-only data access and validation covered by tests. |
| A01 | Implement Auth.js staff sign-in and sessions | F03, P01 | Sign-in/out works; public sign-up absent. |
| A02 | Implement server role and lead visibility policies | A01, F04, P01 | Unauthorized reads and writes fail in integration tests. |
| W01 | Build homepage, company, services, testimonials | F04, P01 | Public content renders responsively and accessibly. |
| W02 | Build contact/enquiry form and creation service | W01, F04 | Valid submission creates `NEW` lead; invalid/abusive input handled. |
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
