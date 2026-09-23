# Product requirements

## Business problem

A service business needs a credible public presence that converts interest into actionable enquiries. Staff need one private place to review and progress those leads without exposing customer information. NexaService demonstrates that complete workflow as a manageable portfolio project. The business identity, copy, and initial service catalogue remain pending.

## Target users

| User | Need |
| --- | --- |
| Visitor | Understand services and the company; contact it or request a quote without an account. |
| STAFF | Sign in, find and work with leads, record notes, and see relevant metrics. |
| ADMIN | Perform staff work and manage assignments, staff, services, testimonials, and selected settings. |

## Goals

1. Present service information clearly on common screen sizes.
2. Capture valid enquiries and route them into an internal lead workflow.
3. Protect internal data with server-side authentication and authorization.
4. Deliver a testable, maintainable full-stack application of limited scope.

## Functional requirements

- Public pages: homepage, service list, individual service details, company information, and testimonials.
- Public visitors use one contact/request-a-quote form to submit a service enquiry without an account.
- Every new enquiry starts with `NEW` status; linking a Service is optional. Visitors do not create accounts.
- STAFF can sign in, view/search/filter leads, view lead details and assigned leads, update lead status, add internal notes, and view relevant dashboard metrics.
- ADMIN can also assign leads and manage services, testimonials, staff users, and selected website settings.
- Lead statuses: `NEW`, `CONTACTED`, `QUALIFIED`, `WON`, `LOST`. Lead assignment is optional.
- Public routes never expose lead data or internal notes. Only ADMIN manages staff accounts and changes public service content. All authorization is enforced server-side.

## Non-functional requirements

- Responsive, keyboard-usable pages with accessible forms and clear validation feedback.
- Server validation at all untrusted boundaries, safe errors, and public-form abuse controls.
- Explicit separation of rendering, business rules, and persistence in TypeScript.
- Automated coverage of critical workflows; reproducible local setup and documented deployment.
- Performance, availability, accessibility, and retention targets need measurable decisions before launch.

## User stories and acceptance criteria

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| US-01 | Visitor explores the business. | Homepage, services list/detail, company information, and testimonials are publicly reachable and usable. |
| US-02 | Visitor submits an enquiry. | Valid input creates one `NEW` lead; service association may be absent; invalid input gets useful feedback and the response reveals no internal data. |
| US-03 | STAFF triages leads. | A signed-in staff user can find permitted leads, view details, change status, and add a private note; unauthenticated access is denied. |
| US-04 | STAFF sees assigned work and metrics. | Assigned view and metrics reflect only leads the user may see; metric definitions are documented before implementation. |
| US-05 | ADMIN assigns work. | ADMIN can assign or clear an eligible assignee; STAFF cannot perform the operation. |
| US-06 | ADMIN manages content and people. | ADMIN can manage services, testimonials, staff, and selected settings; STAFF mutations are denied on the server. |
| US-07 | Visitor information stays private. | Public routes and responses reveal no leads, notes, assignments, or staff account data. |

## MVP scope

The public pages and enquiry/contact path; staff sign-in; lead list, search/filter, detail, status, notes, assignment, assigned view, and basic metrics; administrator management of services, testimonials, staff, and selected settings. MVP completes the enquiry-to-lead workflow with restrained content and visual design.

## Portfolio-complete scope

Polished responsive and accessible states; representative content; unit, integration, component, and end-to-end tests; documented security controls; Docker-based local PostgreSQL; GitHub Actions; and a Vercel deployment using hosted PostgreSQL. This is a quality milestone for the same feature set.

## Non-goals

Payments, appointment scheduling, customer accounts, inventory, real-time chat, multi-tenancy, microservices, Kubernetes, complex CRM automation, and native mobile applications.
