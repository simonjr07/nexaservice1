# Approved architecture decisions

## ADR-001: PostgreSQL instead of MongoDB

**Status:** Approved. **Context:** Leads relate to users, services, and notes, and dashboard filters need reliable relational queries. **Decision:** PostgreSQL is the primary database. **Consequences:** Model relations and constraints explicitly, use migrations, and choose hosted PostgreSQL for production.

## ADR-002: Single Next.js full-stack architecture

**Status:** Approved. **Context:** The public site and dashboard share a modest domain. **Decision:** Use one Next.js App Router application with server-side business logic, Server Actions for suitable mutations, and Route Handlers for useful HTTP endpoints. Do not add Express. **Consequences:** Keep server boundaries explicit inside one deployed application.

## ADR-003: TypeScript across application code

**Status:** Approved. **Context:** UI, server logic, validation, and persistence share domain concepts. **Decision:** Write application code in TypeScript. **Consequences:** Reuse types where helpful and still validate runtime input with Zod.

## ADR-004: Server-side authorization

**Status:** Approved. **Context:** UI checks are bypassable and lead data is private. **Decision:** Enforce identity, role, and resource access on the server for reads and mutations. **Consequences:** Hidden controls and route navigation checks are supplementary; business operations are the security boundary.

## ADR-005: Prisma as ORM

**Status:** Approved. **Context:** The relational model needs typed data access and migration management. **Decision:** Use Prisma for PostgreSQL access. **Consequences:** Centralize Prisma in server-only data-access code and review schema migrations.

## Authentication implementation choices for review

The requested authentication task uses stable NextAuth.js 4.24.15 because its published peer range supports the installed Next.js 16 and React 19. Credentials authenticate against the existing `User` table with no Auth.js adapter or extra auth tables. Auth.js uses an eight-hour JWT cookie session; protected server requests re-read the user to reflect deletion and current role. New development administrator passwords use bcrypt cost 12. These are implementation choices under the approved Auth.js/Prisma architecture, pending human review rather than new approved ADRs.

Task #11 approved ACTIVE/DISABLED account status, ADMIN-controlled management, active-only assignment eligibility, and preservation of historical Lead relationships. The checked-in migration defaults existing accounts to ACTIVE. Protected reads/actions recheck current status rather than relying on JWT expiry; an already-issued cookie remains until sign-out or expiry but cannot authorize a disabled account. Self-disablement/demotion and loss of the last active ADMIN are blocked in serialized database transactions.

Task #13 implements a PostgreSQL-backed 10-attempt/15-minute per-client window for login and public enquiry. This uses the approved database instead of adding Redis or another service; HMAC keys avoid storing raw client IPs. The threshold and Vercel edge/IP assumptions need deployment review. The production administrator CLI design was later approved in Task #15, but its actual use still requires separate approval. Broader password reset/recovery policy and lead visibility remain pending decisions.

Task #14 configures verification-only GitHub Actions CI with Node.js 24 LTS and a disposable PostgreSQL service. The CI job applies checked-in migrations but has no production database access or deploy step. The first production ADMIN strategy was proposed at this stage and subsequently approved in Task #15; the CI job remains unable to touch production.

Task #15 selects Neon Free in AWS Europe West 2 (London) for an initial portfolio trial containing fictional/demo enquiries only. The Free project `nexaservice-demo` was created, its direct endpoint was reached over TLS, and all three checked-in migrations were applied and verified; no hosted application is configured yet. The public form says the business is fictional, requests fictional details, and makes clear no business follow-up occurs. A real customer-enquiry workflow is a separate future decision. The human first selected Vercel Pro, then chose to defer payment and requested Hobby for a personal, non-commercial demo. Vercel's broad commercial-use definition creates an unresolved conflict with the portfolio's original client-attraction purpose; Hobby deployment is paused until Vercel confirms in writing that this specific use is permitted. If it is not, the human will evaluate another free provider that permits commercial portfolios rather than activate a subscription immediately. The human approved explicit, non-public production bootstrap and password-recovery CLIs. They are implemented and tested on a disposable local database, but execution against Neon requires a separate explicit approval. Retention and release access remain pending.
