# Planned application interfaces

This is an interface plan, not an implemented API contract. Form-driven mutations should use Server Actions where appropriate. Add Route Handlers only when an explicit HTTP endpoint is useful. Exact URLs, payload schemas, and pagination conventions are pending.

## Public and protected operations

| Operation | Caller | Planned interface | Requirement |
| --- | --- | --- | --- |
| Read homepage, services, service detail, company information, testimonials | Public | App Router pages/server reads | Return public content only. |
| Submit contact/enquiry | Public | Server Action; Route Handler only if needed | Validate and apply abuse controls; create `NEW` lead. |
| Sign in/out | Staff | Auth.js integration | No public self-registration. |
| List/search/filter leads; read detail and assigned leads | STAFF, ADMIN | Protected server reads | Verify session and lead visibility. |
| Read dashboard metrics | STAFF, ADMIN | Protected server read | Scope metrics to authorized leads. |
| Update status; add internal note | STAFF, ADMIN | Server Actions | Verify session and per-lead access. |
| Assign/unassign lead | ADMIN | Server Action | Validate eligible assignee. |
| Manage services, testimonials, staff, settings | ADMIN | Server Actions | Validate each write and enforce ADMIN. |

## Validation

- Use Zod at server boundaries for form data, parameters, query filters, and HTTP bodies. React Hook Form feedback does not replace server validation.
- Reject invalid enum values. Ignore client assertions about role, note author, or initial lead status.
- An optional service ID must reference an eligible service. Bound page size, search length, and sort choices.
- Check authentication and authorization within every protected Server Action and Route Handler, even when invoked from a protected page.

## Response and error conventions

- Server Actions should return a consistent serializable success result or field/form errors for expected failures. The exact TypeScript shape is pending.
- Explicit HTTP endpoints, if added, should use `400` malformed input, `401` unauthenticated, `403` forbidden, `404` unavailable resource, `409` genuine conflict, and `429` rate limit. Decide whether `403` or `404` better protects private resource existence in each context.
- Unexpected failures produce generic client errors and redacted server logs. Never return stack traces, secrets, or private lead fields.
- A successful public submission returns a neutral acknowledgement, not the created lead record.

## Pending interface decisions

One or two public submission Actions; whether any explicit HTTP endpoint is needed beyond Auth.js integration; URL names; search/pagination semantics; status transition rules; and the precise result/error shape.
