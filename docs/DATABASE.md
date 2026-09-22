# Conceptual database design

This is a PostgreSQL model for later Prisma implementation, not an existing schema. Fields below are proposals; exact types, requiredness, and migration details remain pending where noted.

## Entities and fields

| Entity | Proposed fields | Purpose |
| --- | --- | --- |
| User | `id`, `name`, unique `email`, `role` (ADMIN/STAFF), authentication fields, `createdAt`, `updatedAt`, optional `disabledAt` | Internal staff identity; no public users. |
| Service | `id`, `name`, unique `slug`, `summary`, `description`, publication state, display order, timestamps | Public service content and optional lead context. |
| Lead | `id`, contact name/email, optional phone, enquiry details, `status`, optional `serviceId`, optional `assignedToId`, timestamps | Enquiry and staff workflow record. |
| LeadNote | `id`, `leadId`, `authorId`, body, `createdAt`, optional `updatedAt` | Internal-only lead note. |
| Testimonial | `id`, attribution/name, quote, publication state, display order, timestamps | Public social proof. |
| SiteSettings | singleton/keyed identity, selected settings fields, `updatedAt` | ADMIN-managed website settings. |

Auth.js may require account, session, or verification storage depending on the eventual session and sign-in strategy. That choice does not alter the six initial business entities.

## Relationships

- Service 1-to-many Lead; a Lead may have no Service.
- User 1-to-many assigned Lead; a Lead may be unassigned.
- Lead 1-to-many LeadNote; each note belongs to one Lead.
- User 1-to-many authored LeadNote; each note has one author.
- SiteSettings represents one effective configuration, with exact shape pending.

## Constraints

- Unique normalized User email and Service slug after normalization rules are chosen.
- `User.role` is ADMIN or STAFF. `Lead.status` is `NEW`, `CONTACTED`, `QUALIFIED`, `WON`, or `LOST`; public creation sets `NEW` in business logic and ideally as a database default.
- Foreign keys protect lead service/assignee and note lead/author relations. An assignee must be an eligible staff user.
- Required lead contact fields and length limits need approval; at least one reliable reply channel is required.
- Deletion must avoid silently losing lead history or orphaning notes. The exact archive/delete policy is pending.
- Database constraints complement server-side authorization; notes are never selected into public queries.

## Proposed indexes

Unique User email and Service slug; Lead `createdAt`, `(status, createdAt)`, and `(assignedToId, createdAt)`; LeadNote `(leadId, createdAt)`. Consider Lead `(serviceId, createdAt)` if service filtering is approved. Add text-search indexes only after search behavior and query plans are known.

## Pending schema decisions

Exact contact/enquiry fields; one versus two form shapes; lead visibility; search fields; publication rules; deletion/archival; staff disablement; Auth.js session strategy; settings fields; phone/email requirements; and data retention.
