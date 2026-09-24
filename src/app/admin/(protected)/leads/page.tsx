import type { Metadata } from "next";
import Link from "next/link";
import { LeadStatusBadge, formatLeadDate, leadStatusLabel } from "@/components/dashboard/lead-status";
import { listLeads, listServiceChoices } from "@/features/leads/manage-leads";
import { LEAD_STATUSES, type LeadFilters } from "@/features/leads/validation";
import { requireStaff } from "@/server/auth/authorization";
import { leadManagementRepository } from "@/server/db/repositories/lead-management";

export const metadata: Metadata = { title: "Leads" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pageHref(filters: LeadFilters, page: number) {
  const query = new URLSearchParams();
  if (filters.q) query.set("q", filters.q);
  if (filters.status) query.set("status", filters.status);
  if (filters.serviceId) query.set("serviceId", filters.serviceId);
  query.set("page", String(page));
  return `/admin/leads?${query}`;
}

export default async function LeadsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireStaff();
  let result: Awaited<ReturnType<typeof listLeads>>;
  let services: Awaited<ReturnType<typeof listServiceChoices>>;
  try {
    [result, services] = await Promise.all([
      listLeads(user, await searchParams, leadManagementRepository),
      listServiceChoices(user, leadManagementRepository),
    ]);
  } catch {
    return <p role="alert" className="rounded-2xl border border-line bg-white p-8 text-sm text-muted">Leads could not be loaded right now. Please try again.</p>;
  }

  if (!result) {
    return (
      <div className="rounded-2xl border border-line bg-white p-8">
        <h1 className="text-3xl font-semibold">Invalid lead filters</h1>
        <p className="mt-3 text-sm text-muted">Clear the filters and try again.</p>
        <Link href="/admin/leads" className="mt-5 inline-block text-sm font-semibold text-sea underline-offset-4 hover:underline">View all leads</Link>
      </div>
    );
  }

  const { filters, items, hasNext } = result;
  const filtered = !!(filters.q || filters.status || filters.serviceId);

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">Dashboard / Leads</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-4xl font-semibold tracking-[-0.055em]">Lead inbox</h1><p className="mt-3 text-sm leading-6 text-muted">Enquiries received through the public website.</p></div>
        <span className="rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-muted">Newest first</span>
      </div>

      <form method="get" action="/admin/leads" className="mt-8 grid gap-4 rounded-2xl border border-line bg-white p-5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_1fr_1fr_auto] lg:items-end" aria-label="Search and filter leads">
        <div><label htmlFor="lead-search" className="block text-xs font-semibold text-muted">Search name, email or company</label><input id="lead-search" name="q" type="search" maxLength={100} defaultValue={filters.q ?? ""} placeholder="Search enquiries" className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 text-sm focus-visible:border-sea" /></div>
        <div><label htmlFor="lead-filter-status" className="block text-xs font-semibold text-muted">Status</label><select id="lead-filter-status" name="status" defaultValue={filters.status ?? ""} className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 text-sm focus-visible:border-sea"><option value="">All statuses</option>{LEAD_STATUSES.map((status) => <option value={status} key={status}>{leadStatusLabel(status)}</option>)}</select></div>
        <div><label htmlFor="lead-filter-service" className="block text-xs font-semibold text-muted">Service</label><select id="lead-filter-service" name="serviceId" defaultValue={filters.serviceId ?? ""} className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 text-sm focus-visible:border-sea"><option value="">All services</option>{services.map((service) => <option value={service.id} key={service.id}>{service.name}</option>)}</select></div>
        <button type="submit" className="min-h-11 rounded-full bg-deep px-5 text-sm font-semibold text-white transition-colors hover:bg-sea">Apply</button>
      </form>
      {filtered && <Link href="/admin/leads" className="mt-3 inline-block text-sm font-semibold text-sea underline-offset-4 hover:underline">Clear filters</Link>}

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[#c7d5cf] bg-white p-10 text-center">
          <h2 className="text-xl font-semibold">{filtered ? "No matching leads" : "No enquiries yet"}</h2>
          <p className="mt-2 text-sm text-muted">{filtered ? "Try a different search or clear the filters." : "New public enquiries will appear here."}</p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="admin-records-table w-full border-collapse text-left text-sm">
            <thead className="bg-[#f7f9f7] text-xs font-semibold uppercase tracking-[0.08em] text-muted"><tr><th scope="col" className="px-5 py-4">Lead</th><th scope="col" className="px-5 py-4">Company</th><th scope="col" className="px-5 py-4">Service</th><th scope="col" className="px-5 py-4">Status</th><th scope="col" className="px-5 py-4">Assigned to</th><th scope="col" className="px-5 py-4">Received</th></tr></thead>
            <tbody className="divide-y divide-line">
              {items.map((lead) => (
                <tr key={lead.id} className="align-top hover:bg-[#f8faf8]">
                  <th scope="row" className="px-5 py-4 font-normal"><Link href={`/admin/leads/${lead.id}`} className="font-semibold text-ink underline-offset-4 hover:text-sea hover:underline">{lead.name}</Link><span className="mt-1 block break-all text-xs text-muted">{lead.email}</span></th>
                  <td data-label="Company" className="px-5 py-4 text-muted">{lead.company ?? "—"}</td>
                  <td data-label="Service" className="px-5 py-4 text-muted">{lead.service?.name ?? "General enquiry"}</td>
                  <td data-label="Status" className="px-5 py-4"><LeadStatusBadge status={lead.status} /></td>
                  <td data-label="Assigned to" className="px-5 py-4 text-muted">{lead.assignedUser?.name ?? "Unassigned"}</td>
                  <td data-label="Received" className="px-5 py-4 text-muted"><time dateTime={lead.createdAt.toISOString()}>{formatLeadDate(lead.createdAt)}</time></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(filters.page > 1 || hasNext) && (
        <nav aria-label="Lead pages" className="mt-6 flex items-center justify-between gap-4 text-sm">
          {filters.page > 1 ? <Link href={pageHref(filters, filters.page - 1)} className="font-semibold text-sea underline-offset-4 hover:underline">← Previous</Link> : <span />}
          <span className="text-muted">Page {filters.page}</span>
          {hasNext ? <Link href={pageHref(filters, filters.page + 1)} className="font-semibold text-sea underline-offset-4 hover:underline">Next →</Link> : <span />}
        </nav>
      )}
    </>
  );
}
