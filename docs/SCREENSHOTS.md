# Screenshot capture plan

**Status: pending manual capture.** No screenshots are included in the repository. Capture the local application with clearly fictional Services, Testimonials, Users, and Leads. Do not show real credentials, private customer information, browser cookies, connection strings, or a misleading production URL. Use a disposable development database or a deliberate cleanup plan for staged records. Capture a published fictional Service for the detail page; the application does not seed one automatically.

| View to capture | What it should prove |
| --- | --- |
| Homepage | Brand, navigation, public hierarchy, service preview, fictional Testimonial labeling, and demo disclosure. |
| Services listing | Database-driven published Services, card layout, and public navigation; drafts should be absent. |
| Service detail | A published slug route, description, and quote CTA; use a fictional draft that was explicitly published for the capture. |
| Contact/enquiry form | Accessible labels, required/optional fields, Service selection, fictional-data warning, and validation/success state. Do not submit real details. |
| Staff login | Email/password controls, password visibility control, clear generic error/submit state, and consistent branding. Keep credentials blank or masked. |
| Dashboard overview | Authenticated operational counts, recent Leads, six-month activity, and Service ranking from fictional data; no invented revenue chart. |
| Lead inbox | Real database-backed search, status/service filters, pagination, and readable table/card layout. |
| Lead detail | Fictional contact data, status update, private note with author/time, and ADMIN assignment control. Crop or redact any non-fictional personal data. |
| Service management | ADMIN draft/published states and create/edit/publication controls. |
| Testimonial management | ADMIN publication controls and clearly fictional example content. |
| Settings | ADMIN-only singleton settings form with fictional business contact values. |
| Staff management | ADMIN account list/status controls and role labels using fictional staff identities; never expose password fields or hashes. |
| Responsive/mobile views | At least the public navigation, homepage, enquiry form, and a protected record view at narrow widths, showing usable controls without horizontal overflow. |

For each image, note the route, viewport width, role used (public, STAFF, or ADMIN), and capture date in its eventual caption. Prefer a matched desktop/mobile pair for key flows. A screenshot demonstrates appearance at one moment; it does not replace the permission, persistence, keyboard, or hosted smoke tests in [TESTING.md](TESTING.md) and [DEFINITION_OF_DONE.md](DEFINITION_OF_DONE.md).
