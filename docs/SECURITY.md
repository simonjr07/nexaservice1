Security plan

This document distinguishes implemented controls from remaining security work. /admin requires a staff session; its lead pages contain private data, and its Service, Testimonial, Settings, and Users pages require ADMIN for management.

Authentication

Auth.js/NextAuth.js 4.24.15 credentials sign-in reads the existing PostgreSQL User through Prisma. There is no visitor registration or customer account flow.

Passwords are stored only as bcrypt hashes (cost 12 for newly provisioned or ADMIN-created accounts). The login form and server return generic credential failures and do not log submitted passwords. Unknown accounts undergo a dummy hash comparison to reduce timing differences. Staff management never returns a hash to the frontend.

Unexpected credential lookup or password-comparison errors are caught before Auth.js handles them. The callback receives a generic credentials failure, while the server logs only a fixed message with no exception details, account identifiers, hashes, or submitted values.

The development provisioning and password-reset scripts print only deliberate refusal messages; unexpected Prisma failures receive fixed generic messages rather than raw exception text.

Auth.js uses an eight-hour JWT session in its HTTP-only cookie. NEXTAUTH_SECRET must be a long random secret. Session callbacks expose only ID, name, email, and role; they never expose passwordHash. Auth.js manages CSRF on its sign-in/sign-out endpoints.

The credentials callback consumes a shared PostgreSQL rate-limit counter before looking up an account. Exhaustion returns the same generic Auth.js credentials failure as an incorrect password. Auth.js selects secure cookies when NEXTAUTH_URL is HTTPS in production; confirm cookie flags on the deployed domain.

ADMIN staff creation, editing, disablement, and reactivation are implemented. A local-only command can reset the existing development ADMIN password. Separate production bootstrap and password-recovery CLIs are implemented but have not run against Neon; there is no public recovery route or password-editing management UI.

Authorization

The protected /admin layout and each protected action require a session and a current ACTIVE User row. Disabled or deleted accounts lose protected access immediately on the next request even if their JWT is unexpired; role changes use the current database role. Disablement does not remotely erase the JWT cookie, but the cookie cannot authorize protected work while the account remains DISABLED. /admin/login remains public and rejects disabled accounts with the same generic failure used for other bad credentials.

ADMIN and STAFF can enter the dashboard and currently read all leads and their aggregate analytics, change status, and add internal notes. /admin rechecks staff identity before calling the analytics repository; no public analytics interface exists. Each lead page and mutation also rechecks staff identity on the server. STAFF cannot assign, including by invoking the assignment Action directly. Service management pages and every Service mutation independently require ADMIN, including direct Server Action requests; STAFF cannot manage Services.

Lead details and notes are selected only for protected routes. The note author comes from the current User, never from form data. The initial all-leads STAFF visibility rule requires product review before production; narrower resource checks will be required if it changes.

Never trust client role data, hidden buttons, route layouts, or submitted user IDs as authorization. Enforce policy in server business/data-access paths.

Return minimal data; public paths must never expose leads or internal notes.

Public Service queries filter published = true on the server. Draft details return 404. The quote form lists published Services and validates publication again when an enquiry is submitted. Unpublishing keeps historical Leads and their Service relation.

Testimonial management pages and every mutation require ADMIN, including direct Server Action requests. Public Testimonial queries filter published = true on the server; drafts never enter public views. Displayed entries are explicitly labeled fictional portfolio examples.

Website Settings updates require ADMIN and address only the database-enforced id = 1 singleton. Public reads select the four approved business fields and do not create or change a row. Missing settings expose no fabricated contact details.

Users pages and Server Actions require ADMIN. Mutations recheck an ACTIVE ADMIN inside a serialized database transaction, preventing concurrent administrators from disabling each other and leaving no active administrator. Self-disablement and self-demotion are blocked. Disabled Users remain referenced by historical Leads and LeadNotes; only ACTIVE accounts appear in new assignment choices and pass assignment validation.

Input validation and output safety

Login, public quote, lead search/filter, lead IDs, status changes, notes, assignments, Service writes, Testimonial writes, Settings writes, and staff changes are validated with Zod on the server. Quote fields have length limits; email is trimmed/lowercased; optional blanks normalize to null; selected Service IDs must be valid UUIDs for published records. Service slugs are normalized and constrained before persistence; unique conflicts return safe feedback. Testimonial blank company becomes null; all SiteSettings fields are required. New staff passwords must be at least 12 characters and no more than 72 UTF-8 bytes; edits never overwrite passwords.

Render user text safely; never inject raw HTML from enquiries, notes, testimonials, or settings.

Redact personal data and secrets in logs. Return generic errors for unexpected failures and avoid disclosing internal resource existence.

Rate limiting and public form abuse prevention

Login and enquiry each allow 10 requests per 15-minute fixed window per client identifier. RateLimitBucket rows in PostgreSQL make the counters atomic and shared across server instances; expiry is reset on the next request, and bounded opportunistic cleanup removes expired rows. Keys are HMAC-SHA-256 values derived from NEXTAUTH_SECRET, the flow name, and the client IP. Raw IPs, emails, and passwords are not stored in the limiter. Missing secret or database access fails closed with generic client feedback.

On Vercel, the limiter reads x-vercel-forwarded-for, which Vercel overwrites at its edge (https://vercel.com/docs/headers/request-headers). Elsewhere it deliberately ignores caller-supplied forwarding headers and uses one shared unidentified bucket. A self-hosted production deployment needs an explicitly trusted proxy/client-IP integration before launch; the fallback protects the application but can throttle unrelated visitors together. Distributed attackers and volumetric traffic still require deployment-edge controls such as a reviewed Vercel Firewall rule (https://vercel.com/kb/guide/limit-abuse-with-rate-limiting).

The public quote form uses a visually hidden honeypot: a filled value normally receives a neutral acknowledgement without creating a Lead. All submissions consume a rate-limit attempt before validation. A limited request receives a safe 15-minute wait message and creates no Lead. Client submission controls prevent accidental double clicks. Server field limits and Next.js's default 1 MB Server Action body limit also bound input. No CAPTCHA or external bot provider is used.

The initial public launch is a fictional portfolio demo. The contact page asks for fictional details and states that no business will respond; submissions still persist as Lead records. This copy discourages, but cannot technically prevent, a visitor from entering real information. Restrict access to those records and establish a demo-data retention/deletion policy before launch. A genuine enquiry workflow and stronger backup/recovery policy require separate approval. Do not reveal whether a contact address already exists.

Headers, CSRF, and caching

next.config.ts sets Referrer-Policy: strict-origin-when-cross-origin, X-Content-Type-Options: nosniff, X-Frame-Options: DENY, a restrictive Permissions-Policy, and an incremental CSP covering base-uri, object-src, frame-ancestors, and form-action. It disables X-Powered-By. The CSP intentionally has no script-src or style-src yet; a nonce-based policy must be tested against Next.js before claiming full inline-script protection.

HSTS (max-age=31536000, without includeSubDomains) is added only when VERCEL_ENV=production, where HTTPS is expected. Local and preview responses omit it. Confirm actual production TLS and header behavior after deployment.

Next.js Server Actions (https://nextjs.org/docs/app/guides/data-security) accept POST requests, enforce an Origin/Host check, and have a default 1 MB body limit. No extra allowed origins are configured. Every protected action independently rechecks the current user and role; action IDs and hidden controls are not treated as authorization. Auth.js handles its own CSRF tokens.

Protected pages read the current session/User and mutable data on each request; public pages use dynamic server reads, request-scoped React caching for Settings, and targeted path revalidation after mutations. The development runtime sets Cache-Control: must-revalidate, no-cache on admin HTML and no-store, private on Auth.js responses. Verify cache headers on the production deployment; browser persistence of sensitive admin HTML is not yet proven absent.

Secure configuration and data protection

Store database URLs, Auth.js secrets, and credentials in ignored local environment files and hosted secret settings, never in Git or client-exposed variables.

Use TLS for production traffic and database connections as supported by the selected provider.

Restrict database credentials and protect backups. Establish a restore procedure before production use.

The initial portfolio trial requests fictional enquiry details only and promises no business follow-up. The form still stores submitted values, so it cannot guarantee visitors comply; restrict access and decide demo-record retention/deletion before launch. A genuine customer-enquiry workflow needs separate approval.

Review dependencies and CI/deployment permissions before release. The deployed site still needs a full CSP, edge abuse controls, backup/restore testing, and a data-retention policy.

CI uses an isolated PostgreSQL service and an ephemeral generated Auth.js secret; the fixed database password in its workflow is for that disposable runner only. It has read-only repository permission and receives no production credentials. The approved checked-in migrations were applied to Neon through a direct TLS endpoint and verified; CI still has no Neon credentials. First ADMIN creation and any future production schema or data change require their own authorized release procedure; the development provisioning/reset commands remain blocked in production. The separate production bootstrap/recovery CLIs require NODE_ENV=production, exact confirmation flags, and temporary ADMIN environment variables. They are not web routes or startup hooks and log no credentials. Their successful integration tests use only a disposable local database. The engineer reports failed Neon bootstrap attempts with zero existing ADMIN accounts; no successful production bootstrap or recovery is claimed, and this task does not run either CLI against Neon.

Development admin provisioning

First apply the local migration and generate Prisma Client. In a local PowerShell session, supply your own name, email, and password without putting the password on the command line:

    $env:NODE_ENV = "development"
    $env:ADMIN_NAME = Read-Host "Admin name"
    $env:ADMIN_EMAIL = Read-Host "Admin email"
    $env:ADMIN_PASSWORD = Read-Host "Admin password" -AsSecureString | ConvertFrom-SecureString -AsPlainText
    npm run admin:provision
    Remove-Item Env:ADMIN_PASSWORD, Env:ADMIN_EMAIL, Env:ADMIN_NAME, Env:NODE_ENV

The password must be at least 12 characters and no more than 72 UTF-8 bytes for bcrypt. The command refuses NODE_ENV other than development, rejects an existing email instead of changing its role/password, hashes before storage, and never runs automatically. Keep the ignored .env and local shell private. No account or password is supplied by the repository. The command has not been exercised against a live database in this environment.

To reset the existing development ADMIN password, put the target ADMIN_EMAIL and replacement ADMIN_PASSWORD in the ignored .env and run npm run admin:reset-password with NODE_ENV=development. The command requires DATABASE_URL to match .env and point to localhost, applies the same staff password policy and bcrypt cost 12, and refuses a missing, disabled, or non-ADMIN account. It changes only passwordHash in one transaction, checks bcrypt against the stored value, and never creates an account or prints credentials. It does not provide production password recovery.
