# Security plan

These are requirements for future implementation, not claims that controls already exist.

## Authentication

- Use Auth.js for staff sign-in and sessions. There is no visitor registration or customer account flow.
- Provision and disable staff through an ADMIN-controlled process. Credential provider, session strategy, password policy, and account recovery remain pending.
- Use secure session/cookie settings appropriate to deployment; verify sessions server-side for protected operations.

## Authorization

- Require a verified session for all dashboard reads and writes. Enforce ADMIN for assignment and staff, service, testimonial, and settings management.
- Check resource access on every lead read, status change, and note write. The exact STAFF visibility policy requires approval.
- Never trust client role data, hidden buttons, route layouts, or submitted user IDs as authorization. Enforce policy in server business/data-access paths.
- Return minimal data; public paths must never expose leads or internal notes.

## Input validation and output safety

- Validate all public and internal input with Zod on the server, including IDs, status, filters, and settings. Set length and format limits when fields are finalized.
- Render user text safely; never inject raw HTML from enquiries, notes, testimonials, or settings.
- Redact personal data and secrets in logs. Return generic errors for unexpected failures and avoid disclosing internal resource existence.

## Rate limiting and public form abuse prevention

- Rate-limit enquiry submission and sign-in attempts with a deployment-compatible mechanism. Thresholds and implementation are pending.
- Bound payload sizes and use low-friction bot mitigation appropriate to observed abuse. A honeypot or challenge may be chosen later; no provider is approved now.
- Define duplicate-submission behavior and retention before launch. Do not reveal whether a contact address already exists.

## Secure configuration and data protection

- Store database URLs, Auth.js secrets, and credentials in ignored local environment files and hosted secret settings, never in Git or client-exposed variables.
- Use TLS for production traffic and database connections as supported by the selected provider.
- Restrict database credentials and protect backups. Establish a restore procedure before production use.
- Collect only enquiry data needed for follow-up. Decide retention, deletion, and access procedures before launch.
- Review dependencies and CI/deployment permissions; evaluate security headers and content policy during implementation.
