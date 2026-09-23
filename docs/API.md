# Planned application interfaces

This is primarily an interface plan. Staff sign-in/sign-out uses the Auth.js HTTP handler at `/api/auth/[...nextauth]`. Public quote intake and protected content mutations use Server Actions. Add Route Handlers only when an explicit HTTP endpoint is useful.

## Public and protected operations

| Operation | Caller | Planned interface | Requirement |
| --- | --- | --- | --- |
| Read homepage, services, service detail, company information, testimonials | Public | App Router pages/server reads | Return public content only. |
| Submit contact/enquiry | Public | Implemented `/contact#request-quote` Server Action | Zod validation, honeypot, optional published Service, `NEW` unassigned Lead, safe response; no account required. |
| Sign in/out | Staff | Implemented Auth.js credentials handler and `/admin/login` UI | Email/password against User; no public self-registration. Real database flow remains unverified here. |
| List/search/filter leads; read detail | STAFF, ADMIN | Implemented `/admin/leads` and `/admin/leads/[id]` server reads | Fresh session/User check; all leads visible in this initial workflow. Assigned-only view remains planned. |
| Read dashboard metrics | STAFF, ADMIN | Implemented protected `/admin` server read | All-lead status/current-UTC-month counts, five recent Leads, six UTC months, and up to five Services ranked by linked enquiries. No public endpoint. |
| Update status; add internal note | STAFF, ADMIN | Implemented lead-detail Server Actions | Verify current staff identity; validate status/content; derive note author from session. |
| Assign/unassign lead | ADMIN | Implemented lead-detail Server Action | Check ADMIN on the server; validate current User or clear assignment. |
| List/create/edit/publish/unpublish Services | ADMIN | Implemented `/admin/services` pages and Server Actions | Fresh ADMIN check for each read/write; Zod input validation; no hard deletion. |
| List/read Services | Public | Implemented `/services` and `/services/[slug]` server reads | Only `published = true`; unknown or unpublished detail returns 404. |
| List/create/edit/publish/unpublish Testimonials | ADMIN | Implemented `/admin/testimonials` pages and Server Actions | Fresh ADMIN check for every read/write; Zod validation; no hard deletion. |
| Read Testimonials | Public | Implemented homepage server read | Only published records; displayed as fictional portfolio examples. |
| Read/update SiteSettings | ADMIN | Implemented `/admin/settings` page and Server Action | Fresh ADMIN check; validate all four fields; upsert only singleton ID 1. |
| Read public business settings | Public | Implemented shared layout and page reads | Name/contact fields only; missing row uses NexaService with no contact details; public reads never write. |
| Manage staff | ADMIN | Planned Server Actions | Validate each write and enforce ADMIN. |

## Validation

- Public quote fields: required `name` (2–120), `email` (valid format, max 254), and `message` (10–3000); optional `phone` (7–40), `company` (max 120), and `serviceId` (UUID of a currently published Service). Text is trimmed, email lowercased, and blank optional values become null in persistence. The page lists published services only; an empty list leaves general enquiry available.
- Lead list query parameters: `q` searches name/email/company case-insensitively (max 100 characters); `status` accepts the five Lead statuses; `serviceId` is a UUID; `page` is 1–1000. Results are newest-first in pages of 50. Invalid filters show a reset link rather than running an unbounded query.
- Lead mutation inputs: UUID lead ID, one of `NEW`, `CONTACTED`, `QUALIFIED`, `WON`, `LOST`, a trimmed internal note of 2–2000 characters, or an eligible ADMIN/STAFF User ID (empty clears assignment). No client-supplied author or role is accepted. Any listed status may currently replace another; transition rules are pending review.
- Use Zod at server boundaries for form data, parameters, query filters, and HTTP bodies. React Hook Form feedback does not replace server validation.
- Reject invalid enum values. Ignore client assertions about role, note author, or initial lead status.
- An optional service ID must reference an eligible service. Bound page size, search length, and sort choices.
- Service writes require name (2–120), slug (3–100), short description (10–300), description (20–5000), and a boolean publication state. Slugs are trimmed/lowercased, whitespace becomes hyphens, and only lowercase ASCII letters, digits, and single separating hyphens are accepted. Existing slugs do not change when only the name changes. Duplicate slugs return field feedback, including on a database unique-constraint race. Service IDs must be UUIDs.
- Testimonial writes require a customer name (2–120), content (20–2000), optional company (max 120; blank becomes null), and boolean publication state. IDs are UUIDs. Settings require business name (2–120), valid email (max 254, trimmed/lowercased), phone (7–40, constrained characters), and address (5–300). All settings fields are required because the schema has no nullable contact fields.
- Check authentication and authorization within every protected Server Action and Route Handler, even when invoked from a protected page.

## Response and error conventions

- The quote Action returns only `{status: "success"}`, `{status: "invalid", fieldErrors}`, or `{status: "error"}`. The success state has no Lead ID, status, assignment, or private fields. Other Server Action result shapes remain pending.
- Lead Actions return a small `status` result (`success`, `invalid`, `notFound`, `forbidden`, or generic `error`); invalid results may include a safe message. They never return raw Lead or User records. Unknown lead detail URLs return a 404. Database failures show a generic UI error.
- Service Actions return a small status result (`success`, `invalid`, `duplicate`, `notFound`, or generic `error`) and safe field errors when relevant. ADMIN authorization happens before handling input. The public listing/detail never read draft records. The quote page may receive a `serviceId` query parameter to preselect a currently published option; submission validates it again.
- Testimonial and Settings Actions return a small status result (`success`, `invalid`, `notFound`, or generic `error`) and safe field errors. Each action checks ADMIN before parsing or writing. Public testimonial queries explicitly filter publication; public settings reads return only approved business fields.
- Explicit HTTP endpoints, if added, should use `400` malformed input, `401` unauthenticated, `403` forbidden, `404` unavailable resource, `409` genuine conflict, and `429` rate limit. Decide whether `403` or `404` better protects private resource existence in each context.
- Unexpected failures produce generic client errors and redacted server logs. Never return stack traces, secrets, or private lead fields.
- A successful public submission returns a neutral acknowledgement, not the created lead record.

## Pending interface decisions

Whether any explicit HTTP endpoint is needed beyond the implemented Auth.js handler; remaining URL names, search/pagination semantics, status transition rules, and result/error shapes for future operations.
