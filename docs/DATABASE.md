# Database design and status

The initial PostgreSQL schema is defined in `prisma/schema.prisma`. Prisma 7.10.0 validation and Client generation pass. `prisma/migrations/20260923000000_initial/migration.sql` is present. On 2026-09-23, `npx prisma migrate status` connected to local PostgreSQL and reported the schema up to date; a transactional authentication test also queried and wrote a record that was rolled back. Docker CLI/container health could not be inspected here. This task did not provision an administrator.

## Implemented models

| Model | Fields | Relationships |
| --- | --- | --- |
| User | UUID `id`, `name`, unique `email`, `passwordHash`, `role` (ADMIN/STAFF), `createdAt`, `updatedAt` | May be assigned Leads and author LeadNotes. The development-only provisioning command can create the first ADMIN after migration. |
| Service | UUID `id`, `name`, unique `slug`, `shortDescription`, `description`, `published` (false by default), timestamps | May be referenced by Leads. |
| Lead | UUID `id`, `name`, `email`, optional `phone` and `company`, `message`, `status` (NEW by default), optional `serviceId` and `assignedUserId`, timestamps | Optional Service and assigned User; many LeadNotes. |
| LeadNote | UUID `id`, `content`, `leadId`, `authorId`, timestamps | Requires one Lead and one User author. Internal only in future application logic. |
| Testimonial | UUID `id`, `customerName`, optional `company`, `content`, `published` (false by default), timestamps | No foreign keys. |
| SiteSettings | integer `id` (default 1), `businessName`, `email`, `phone`, `address`, `updatedAt` | One effective single-business record; none is seeded. |

`LeadStatus` is `NEW`, `CONTACTED`, `QUALIFIED`, `WON`, or `LOST`. `Role` is `ADMIN` or `STAFF`. Optional fields are limited to the approved optional contact/context relationships and testimonial company.

## Constraints and deletion behavior

- Primary keys and foreign keys are in the migration. `User.email` and `Service.slug` are unique. Lead status has a database default of `NEW`.
- Every foreign key uses `ON DELETE RESTRICT`: deleting a Service, assigned User, Lead, or note author while referenced is blocked. This protects lead history and internal notes from cascade deletion. A future archive/deactivation policy is still needed.
- The migration adds a PostgreSQL check requiring `SiteSettings.id = 1`. Combined with the primary key, at most one settings row can exist. Future application code should read/upsert ID 1; it must not assume the row already exists.
- Prisma generates UUID values and `updatedAt` values through the Client. Raw SQL inserts must supply values where the migration has no database default.
- Unique email/slug comparisons are currently PostgreSQL case-sensitive. Authentication and development provisioning trim/lowercase staff emails before lookup/storage; this does not enforce case-insensitive uniqueness for rows inserted by other means. Service slug normalization is pending.

## Query indexes

- Lead `createdAt` supports newest-first lists.
- Lead `(status, createdAt)` supports status-filtered lists.
- Lead `(assignedUserId, createdAt)` supports assigned-work lists.
- Lead `(serviceId, createdAt)` supports service-filtered lists.
- LeadNote `(leadId, createdAt)` supports ordered notes for a lead.

Unique indexes on User email and Service slug come from their unique constraints. No text-search index is added before search behavior is decided.

## Migration and development data

Apply the checked-in migration to a new **local development** database using the commands in [Deployment](DEPLOYMENT.md). Do not run reset or volume-removal commands against data you need to keep. This task does not seed records. A later seed can add clearly fictional, non-sensitive services and testimonials after content is approved. The explicit development-only command in [Security](SECURITY.md#development-admin-provisioning) hashes a locally supplied password and creates an ADMIN; it has not been run against a live database here.

## Decisions still pending

Database-level case-insensitive email uniqueness, slug normalization, lead search fields, staff and lead deletion or archival, staff visibility, production data retention, and production administrator provisioning. The user-specified initial field list is implemented; changes to it need review before a later migration.
