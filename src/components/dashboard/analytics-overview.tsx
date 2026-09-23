import Link from "next/link";
import type { DashboardAnalytics } from "@/features/dashboard/get-dashboard-analytics";
import { LEAD_STATUSES } from "@/features/leads/validation";
import { formatLeadDate, LeadStatusBadge, leadStatusLabel } from "@/components/dashboard/lead-status";

function chartWidth(value: number, maximum: number) {
  return value === 0 || maximum === 0 ? "0%" : `${Math.max(6, Math.round(value / maximum * 100))}%`;
}

export function AnalyticsOverview({ analytics }: { analytics: DashboardAnalytics }) {
  const { totalLeads, leadsThisMonth, statusCounts, months, recentLeads, requestedServices } = analytics;
  const cards = [
    { label: "Total Leads", value: totalLeads, help: "All stored enquiries" },
    { label: "New Leads", value: statusCounts.NEW, help: "Currently awaiting first contact" },
    { label: "Leads This Month", value: leadsThisMonth, help: "Created in the current UTC month" },
    { label: "Contacted Leads", value: statusCounts.CONTACTED, help: "Currently contacted" },
    { label: "Qualified Leads", value: statusCounts.QUALIFIED, help: "Currently qualified" },
    { label: "Won Leads", value: statusCounts.WON, help: "Currently marked won" },
    { label: "Lost Leads", value: statusCounts.LOST, help: "Currently marked lost" },
  ];
  const busiestMonth = Math.max(...months.map((month) => month.count), 0);

  return <>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">Dashboard / Overview</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em]">Enquiry overview</h1><p className="mt-3 text-sm leading-6 text-muted">Current Lead activity and follow-up priorities from the database.</p></div>
      <span className="rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-muted">Calendar months use UTC</span>
    </div>

    {totalLeads === 0 && <p role="status" className="mt-8 rounded-2xl border border-[#d7e4d2] bg-[#eaf0e8] p-5 text-sm leading-7 text-ink">No enquiries have been received yet. New public requests will appear here and in the Lead inbox.</p>}

    <section aria-labelledby="summary-heading" className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3"><h2 id="summary-heading" className="text-2xl font-semibold tracking-[-0.04em]">Lead summary</h2><p className="text-xs text-muted">Operational counts, not revenue or confirmed customers.</p></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <div key={card.label} className="rounded-2xl border border-line bg-white p-6"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-sea">{card.label}</p><p className="mt-5 text-4xl font-semibold tracking-[-0.06em] tabular-nums">{card.value}</p><p className="mt-2 text-xs leading-5 text-muted">{card.help}</p></div>)}</div>
    </section>

    <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,1fr)]">
      <section aria-labelledby="recent-heading" className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="recent-heading" className="text-xl font-semibold tracking-[-0.03em]">Recent Leads</h2><p className="mt-1 text-xs text-muted">Five newest enquiries, including general requests.</p></div><Link href="/admin/leads" className="text-sm font-semibold text-sea hover:underline">View all Leads ↗</Link></div>
        {recentLeads.length === 0 ? <p className="mt-7 rounded-xl bg-[#f7f9f7] p-5 text-sm text-muted">No Leads to show yet.</p> : <ol className="mt-6 divide-y divide-line border-t border-line">{recentLeads.map((lead) => <li key={lead.id} className="flex flex-wrap items-start justify-between gap-3 py-5"><div className="min-w-0"><Link href={`/admin/leads/${lead.id}`} className="font-semibold text-ink hover:text-sea hover:underline">{lead.name}</Link><p className="mt-1 text-xs text-muted">{lead.service?.name ?? (lead.serviceId ? "Service unavailable" : "General enquiry")}</p><p className="mt-1 text-xs text-muted"><time dateTime={lead.createdAt.toISOString()}>{formatLeadDate(lead.createdAt)}</time></p></div><LeadStatusBadge status={lead.status} /></li>)}</ol>}
      </section>

      <section aria-labelledby="status-heading" className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h2 id="status-heading" className="text-xl font-semibold tracking-[-0.03em]">Lead status distribution</h2>
        <p className="mt-1 text-xs text-muted">Current status of all stored Leads.</p>
        <ul className="mt-7 space-y-5">{LEAD_STATUSES.map((status) => <li key={status}><div className="mb-2 flex justify-between gap-4 text-sm"><span className="font-semibold">{leadStatusLabel(status)}</span><span className="tabular-nums text-muted">{statusCounts[status]}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-[#e8eeea]" aria-hidden="true"><div className="h-full rounded-full bg-sea" style={{ width: chartWidth(statusCounts[status], totalLeads) }} /></div></li>)}</ul>
      </section>
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <section aria-labelledby="activity-heading" className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h2 id="activity-heading" className="text-xl font-semibold tracking-[-0.03em]">Enquiry activity</h2><p className="mt-1 text-xs leading-5 text-muted">Leads created in each of the last six UTC calendar months, including this month.</p>
        <ul className="mt-7 space-y-4">{months.map((month) => <li key={`${month.year}-${month.month}`} className="grid grid-cols-[5rem_minmax(0,1fr)_2rem] items-center gap-3 text-sm"><span className="text-xs font-semibold text-muted">{month.label}</span><div className="h-3 overflow-hidden rounded-full bg-[#e8eeea]" aria-hidden="true"><div className="h-full rounded-full bg-sea" style={{ width: chartWidth(month.count, busiestMonth) }} /></div><span className="text-right font-semibold tabular-nums">{month.count}</span></li>)}</ul>
      </section>

      <section aria-labelledby="services-heading" className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h2 id="services-heading" className="text-xl font-semibold tracking-[-0.03em]">Most requested Services</h2><p className="mt-1 text-xs leading-5 text-muted">Service-linked enquiry counts. Unpublished Services remain in this historical view.</p>
        {requestedServices.length === 0 ? <p className="mt-7 rounded-xl bg-[#f7f9f7] p-5 text-sm text-muted">No enquiries are linked to a Service yet.</p> : <ol className="mt-6 divide-y divide-line border-t border-line">{requestedServices.map((service, index) => <li key={service.id} className="flex items-center justify-between gap-4 py-4"><div className="flex min-w-0 items-center gap-4"><span aria-hidden="true" className="text-xs font-semibold text-sea">{String(index + 1).padStart(2, "0")}</span><div><p className="break-words text-sm font-semibold">{service.name}</p>{!service.published && <p className="mt-0.5 text-xs text-muted">Unpublished</p>}</div></div><span className="shrink-0 text-sm font-semibold tabular-nums">{service.count} <span className="font-normal text-muted">{service.count === 1 ? "enquiry" : "enquiries"}</span></span></li>)}</ol>}
      </section>
    </div>
  </>;
}
