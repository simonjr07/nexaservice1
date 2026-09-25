Database design and status

The PostgreSQL schema is defined in prisma/schema.prisma. Prisma 7.10.0 validation and Client generation pass. The initial, account-status, and additive request-rate-limit migrations are applied locally and on the approved Neon Free demo database; Prisma migration status reports both schemas up to date. The Neon migration used a direct TLS endpoint and was verified read-only afterward. The account-status migration leaves existing Users active. The limiter migration adds one operational table without changing business records or Lead foreign keys. Docker CLI/container health has not been independently inspected here.

Implemented models

User — UUID id, name, unique email, passwordHash, role (ADMIN/STAFF), status (ACTIVE by default or DISABLED), createdAt, and updatedAt. A User may be assigned Leads and author LeadNotes. The development-only provisioning command creates the first ADMIN; later accounts are managed by an active ADMIN.

Service — UUID id, name, unique slug, shortDescription, description, published (false by default), and timestamps. A Service may be referenced by Leads.

Lead — UUID id, name, email, optional phone and company, message, status (NEW by default), optional serviceId and assignedUserId, and timestamps. A Lead may reference a Service and assigned User and have many LeadNotes.

LeadNote — UUID id, content, leadId, authorId, and timestamps. Each note requires one Lead and one User author. Notes are internal only.

Testimonial — UUID id, customerName, optional company, content, published (false by default), and timestamps. There are no foreign keys. ADMIN manages creation, editing, and publication; public reads filter published = true.

SiteSettings — Integer id (default 1), businessName, email, phone, address, and updatedAt. This is one effective single-business record, initialized by explicit ADMIN save; none is seeded.

RateLimitBucket — HMAC key (primary key), attempt count, and expiresAt. This is short-lived operational login/enquiry throttle state with no relationship to Users or Leads.

LeadStatus is NEW, CONTACTED, QUALIFIED, WON, or LOST. Role is ADMIN or STAFF. Optional fields are limited to the approved optional contact/context relationships and testimonial company.

Constraints and deletion behavior

Primary keys and foreign keys are in the migrations. User.email and Service.slug are unique. Lead status defaults to NEW; User account status defaults to ACTIVE.

Every foreign key uses ON DELETE RESTRICT: deleting a Service, assigned User, Lead, or note author while referenced is blocked. Disabling a User keeps existing Lead assignments and LeadNote authorship. Hard deletion and broader retention policy remain undecided.

The migration adds a PostgreSQL check requiring SiteSettings.id = 1. Combined with the primary key, at most one settings row can exist. The settings repository reads/upserts ID 1; public reads never initialize or overwrite the row. If absent, the UI uses NexaService and omits email/phone/address.

Prisma generates UUID values and updatedAt values through the Client. Raw SQL inserts must supply values where the migration has no database default.

Unique email/slug comparisons are PostgreSQL case-sensitive. Authentication, development provisioning, and ADMIN staff creation/editing trim/lowercase staff emails; management also checks case-insensitive duplicates and handles unique-constraint races. Direct database writes could still create case variants, so database-level case-insensitive uniqueness remains a pending decision. Service management trims and lowercases slugs, turns whitespace into hyphens, validates their shape, and handles unique constraint conflicts.

Query indexes

Lead createdAt supports newest-first lists.

Lead (status, createdAt) supports status-filtered lists.

Lead (assignedUserId, createdAt) supports assigned-work lists.

Lead (serviceId, createdAt) supports service-filtered lists.

LeadNote (leadId, createdAt) supports ordered notes for a lead.

RateLimitBucket expiresAt supports bounded cleanup of expired counters; its primary key supports atomic upserts.

Unique indexes on User email and Service slug come from their unique constraints. No text-search index is added before search behavior is decided.

Dashboard aggregation reads

The protected dashboard groups Leads by current status, counts Leads created in the current UTC month, and groups the last six UTC calendar months by createdAt year/month. The business layer supplies zero-count months and handles year transitions. A bounded query selects the five most recent Leads with only their display fields and optional Service name. Service relation counts rank up to five Services with at least one linked Lead, including unpublished Services; general enquiries without serviceId do not enter that ranking. These queries use the existing schema and indexes. No Lead records are loaded wholesale to calculate totals. Counts describe enquiries, not revenue or confirmed customers.

Migration and development data

Apply the checked-in migration to a new local development database using the commands in Deployment (DEPLOYMENT.md). Do not run reset or volume-removal commands against data you need to keep. This task does not seed records. A later seed can add clearly fictional, non-sensitive services and testimonials after content is approved. The explicit development-only command in Security (SECURITY.md#development-admin-provisioning) hashes a locally supplied password and creates an ADMIN; it has not been run against a live database here.

Decisions still pending

Database-level case-insensitive email uniqueness, database-level slug format enforcement, staff and lead deletion or archival, the final STAFF visibility policy, production data retention, and execution of the approved production ADMIN bootstrap (the CLI is implemented and disposable-database tested). Application slug normalization is implemented for ADMIN writes. Service hard deletion is unavailable; unpublishing leaves historical Lead references intact. Changing a published slug changes its URL, and redirect management is not implemented. The initial lead list searches name/email/company with case-insensitive substring filters; no text-search index has been added. The user-specified initial field list is implemented; changes to it need review before a later migration.
