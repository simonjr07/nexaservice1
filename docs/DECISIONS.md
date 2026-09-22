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
