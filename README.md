# NexaService

NexaService is a planned service-business website and secure internal operations dashboard. This portfolio project aims to demonstrate professional full-stack engineering for agency clients, direct business clients, and freelance work while remaining small enough to finish.

Visitors will browse services, company information, and testimonials, then contact the business or request a quote. Staff will work with leads in a private dashboard. Administrators will also manage staff and selected public content. Public visitors will not create accounts.

## Current status

**Initial application shell.** The public site now has responsive navigation, a homepage, and static Services, About, and Contact pages. `/admin` is a public visual preview with placeholder sections only. The enquiry form, database, authentication, operational dashboard, tests, and deployment workflow remain planned. No quote request can be submitted yet.

## Planned stack

One Next.js App Router application using React, TypeScript, and Tailwind CSS; PostgreSQL with Prisma; Zod; Auth.js; React Hook Form; Vitest, React Testing Library, and Playwright; Docker; GitHub Actions; Vercel; and hosted PostgreSQL for production. Provider and operational details marked pending in the docs require a later decision.

## Documentation

- [Product requirements](docs/PRODUCT_REQUIREMENTS.md): users, scope, stories, and acceptance criteria
- [Architecture](docs/ARCHITECTURE.md): boundaries, flows, and proposed structure
- [Database](docs/DATABASE.md): conceptual entities and constraints
- [Application interfaces](docs/API.md): operations and error conventions
- [Task plan](docs/TASKS.md): phases, dependencies, and completion checks
- [Architecture decisions](docs/DECISIONS.md): approved ADRs
- [Testing](docs/TESTING.md): planned coverage
- [Security](docs/SECURITY.md): security requirements
- [Deployment](docs/DEPLOYMENT.md): planned local and production workflow

Run the current shell locally with `npm run dev`. The public quote CTA opens an honest coming-soon contact page; it does not submit an enquiry. Do not add private data or working admin actions to `/admin` until authentication and server-side authorization are implemented.
