NexaService engineering instructions

The root README and docs/ are this project's source of truth. Before implementing a feature, read the relevant product, architecture, database, interface, task, decision, testing, security, and deployment documents. Treat pending decisions as pending; ask the human decision-maker only when work depends on them.

Autonomy and approvals

Decide routine technical details within an approved task independently. Reuse project conventions, prefer the simplest production-appropriate solution, and document significant decisions. Do not repeat questions already answered.

You may implement approved work, fix ordinary bugs, inspect development logs, run checks, generate Prisma Client, update documentation, perform non-destructive local verification, and fix CI failures within the approved scope.

Stop for credentials the human must supply; purchases or paid resources; a production hosting or database provider change; destructive database operations; production data changes outside an explicitly approved operation; production ADMIN creation or recovery; production deployment without prior authorization; major architecture changes; or meaningful financial or security implications.

When human input is necessary, ask one clear question with options and their consequences. Follow the current approvals and launch constraints in docs/DECISIONS.md and docs/DEPLOYMENT.md.

Scope and architecture

Work on one approved task at a time. Do not add unrelated features or expand scope.

Do not change approved architecture without human approval. Keep one Next.js App Router full-stack application; do not add a separate backend.

Use TypeScript for application code. Follow the documented feature, server-side business logic, and data-access boundaries; keep Prisma access out of React components.

Enforce authentication and authorization on the server for every protected read and mutation. Validate all untrusted input on the server.

Safety and quality

Never expose secrets or credentials in code, output, logs, or client data. Do not modify environment files containing real credentials.

Explain the need for any new dependency before introducing it.

Write or update relevant tests when implementing behavior. Run applicable lint, type-check, test, and build checks; report any check that could not run.

Update documentation when implementation changes documented behavior. Clearly distinguish completed work from planned work.

Write repository documentation in clean plain text without visible Markdown formatting marks. Use clear headings, spacing, prose, and explicit Complete or Pending status words. Keep technical commands and paths accurate.

Do not make destructive database changes without human approval. Do not commit or push unless explicitly instructed.

Task handoff

At the end of each task, summarize files changed, functionality implemented, tests performed, tests that could not run, assumptions, and unresolved questions.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
