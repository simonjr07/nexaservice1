# Security plan

This document distinguishes implemented controls from remaining security work. `/admin` requires a staff session; its lead pages contain private data, and its Service, Testimonial, and Settings pages allow ADMIN management. Staff account management remains planned.

## Authentication

- Auth.js/NextAuth.js 4.24.15 credentials sign-in reads the existing PostgreSQL `User` through Prisma. There is no visitor registration or customer account flow.
- Passwords are stored only as bcrypt hashes (cost 12 for newly provisioned development accounts). The login form and server return generic credential failures and do not log submitted passwords. Unknown accounts undergo a dummy hash comparison to reduce timing differences.
- Auth.js uses an eight-hour JWT session in its HTTP-only cookie. `NEXTAUTH_SECRET` must be a long random secret. Session callbacks expose only ID, name, email, and role; they never expose `passwordHash`. Auth.js manages CSRF on its sign-in/sign-out endpoints.
- Staff account disablement, password reset/recovery, and production provisioning are not yet implemented. The development command below is for the first local ADMIN only.

## Authorization

- The protected `/admin` layout requires a session and a current `User` row. Deleted accounts lose access even if their JWT is unexpired; role changes use the current database role. `/admin/login` remains public.
- ADMIN and STAFF can enter the dashboard and currently read all leads, change status, and add internal notes. Each lead page and mutation rechecks staff identity on the server. STAFF cannot assign, including by invoking the assignment Action directly. Service management pages and every Service mutation independently require ADMIN, including direct Server Action requests; STAFF cannot manage Services.
- Lead details and notes are selected only for protected routes. The note author comes from the current User, never from form data. The initial all-leads STAFF visibility rule requires product review before production; narrower resource checks will be required if it changes.
- Never trust client role data, hidden buttons, route layouts, or submitted user IDs as authorization. Enforce policy in server business/data-access paths.
- Return minimal data; public paths must never expose leads or internal notes.
- Public Service queries filter `published = true` on the server. Draft details return 404. The quote form lists published Services and validates publication again when an enquiry is submitted. Unpublishing keeps historical Leads and their Service relation.
- Testimonial management pages and every mutation require ADMIN, including direct Server Action requests. Public Testimonial queries filter `published = true` on the server; drafts never enter public views. Displayed entries are explicitly labeled fictional portfolio examples.
- Website Settings updates require ADMIN and address only the database-enforced `id = 1` singleton. Public reads select the four approved business fields and do not create or change a row. Missing settings expose no fabricated contact details.

## Input validation and output safety

- Login, public quote, lead search/filter, lead IDs, status changes, notes, assignments, Service writes, Testimonial writes, and Settings writes are validated with Zod on the server. Quote fields have length limits; email is trimmed/lowercased; optional blanks normalize to null; selected Service IDs must be valid UUIDs for published records. Service slugs are normalized and constrained before persistence; unique conflicts return safe feedback. Testimonial blank company becomes null; all SiteSettings fields are required.
- Render user text safely; never inject raw HTML from enquiries, notes, testimonials, or settings.
- Redact personal data and secrets in logs. Return generic errors for unexpected failures and avoid disclosing internal resource existence.

## Rate limiting and public form abuse prevention

- Rate-limit enquiry submission and sign-in attempts with a deployment-compatible mechanism. Thresholds and implementation are pending; neither flow currently has deployment-grade rate limiting, which is required before production use.
- The public quote form uses a visually hidden honeypot: a filled value receives a neutral acknowledgement without creating a Lead. Server field limits and Next.js's default Server Action body limit also bound input. No CAPTCHA or external bot provider is used.
- Define duplicate-submission behavior and retention before launch. Do not reveal whether a contact address already exists.

## Secure configuration and data protection

- Store database URLs, Auth.js secrets, and credentials in ignored local environment files and hosted secret settings, never in Git or client-exposed variables.
- Use TLS for production traffic and database connections as supported by the selected provider.
- Restrict database credentials and protect backups. Establish a restore procedure before production use.
- Collect only enquiry data needed for follow-up. Decide retention, deletion, and access procedures before launch.
- Review dependencies and CI/deployment permissions; evaluate security headers and content policy during implementation.

## Development admin provisioning

First apply the local migration and generate Prisma Client. In a local PowerShell session, supply your own name, email, and password without putting the password on the command line:

```powershell
$env:NODE_ENV = "development"
$env:ADMIN_NAME = Read-Host "Admin name"
$env:ADMIN_EMAIL = Read-Host "Admin email"
$env:ADMIN_PASSWORD = Read-Host "Admin password" -AsSecureString | ConvertFrom-SecureString -AsPlainText
npm run admin:provision
Remove-Item Env:ADMIN_PASSWORD, Env:ADMIN_EMAIL, Env:ADMIN_NAME, Env:NODE_ENV
```

The password must be at least 12 characters and no more than 72 UTF-8 bytes for bcrypt. The command refuses `NODE_ENV` other than `development`, rejects an existing email instead of changing its role/password, hashes before storage, and never runs automatically. Keep the ignored `.env` and local shell private. No account or password is supplied by the repository. The command has not been exercised against a live database in this environment.
