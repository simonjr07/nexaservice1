# Planned application interfaces

This is primarily an interface plan. Staff sign-in/sign-out uses the Auth.js HTTP handler at `/api/auth/[...nextauth]`. Public quote intake is implemented as one Server Action on `/contact#request-quote`; protected business operations below remain planned. Add Route Handlers only when an explicit HTTP endpoint is useful.

## Public and protected operations

| Operation | Caller | Planned interface | Requirement |
| --- | --- | --- | --- |
| Read homepage, services, service detail, company information, testimonials | Public | App Router pages/server reads | Return public content only. |
| Submit contact/enquiry | Public | Implemented `/contact#request-quote` Server Action | Zod validation, honeypot, optional published Service, `NEW` unassigned Lead, safe response; no account required. |
| Sign in/out | Staff | Implemented Auth.js credentials handler and `/admin/login` UI | Email/password against User; no public self-registration. Real database flow remains unverified here. |
| List/search/filter leads; read detail and assigned leads | STAFF, ADMIN | Protected server reads | Verify session and lead visibility. |
| Read dashboard metrics | STAFF, ADMIN | Protected server read | Scope metrics to authorized leads. |
| Update status; add internal note | STAFF, ADMIN | Server Actions | Verify session and per-lead access. |
| Assign/unassign lead | ADMIN | Server Action | Validate eligible assignee. |
| Manage services, testimonials, staff, settings | ADMIN | Server Actions | Validate each write and enforce ADMIN. |

## Validation

- Public quote fields: required `name` (2–120), `email` (valid format, max 254), and `message` (10–3000); optional `phone` (7–40), `company` (max 120), and `serviceId` (UUID of a currently published Service). Text is trimmed, email lowercased, and blank optional values become null in persistence. The page lists published services only; an empty list leaves general enquiry available.
- Use Zod at server boundaries for form data, parameters, query filters, and HTTP bodies. React Hook Form feedback does not replace server validation.
- Reject invalid enum values. Ignore client assertions about role, note author, or initial lead status.
- An optional service ID must reference an eligible service. Bound page size, search length, and sort choices.
- Check authentication and authorization within every protected Server Action and Route Handler, even when invoked from a protected page.

## Response and error conventions

- The quote Action returns only `{status: "success"}`, `{status: "invalid", fieldErrors}`, or `{status: "error"}`. The success state has no Lead ID, status, assignment, or private fields. Other Server Action result shapes remain pending.
- Explicit HTTP endpoints, if added, should use `400` malformed input, `401` unauthenticated, `403` forbidden, `404` unavailable resource, `409` genuine conflict, and `429` rate limit. Decide whether `403` or `404` better protects private resource existence in each context.
- Unexpected failures produce generic client errors and redacted server logs. Never return stack traces, secrets, or private lead fields.
- A successful public submission returns a neutral acknowledgement, not the created lead record.

## Pending interface decisions

Whether any explicit HTTP endpoint is needed beyond the implemented Auth.js handler; remaining URL names, search/pagination semantics, status transition rules, and result/error shapes for future operations.
