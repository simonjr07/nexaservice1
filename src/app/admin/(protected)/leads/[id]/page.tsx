import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AssignmentForm, NoteForm, StatusForm } from "@/components/dashboard/lead-forms";
import { LeadStatusBadge, formatLeadDate } from "@/components/dashboard/lead-status";
import { getLeadDetail, listStaffChoices } from "@/features/leads/manage-leads";
import { requireStaff } from "@/server/auth/authorization";
import { leadManagementRepository } from "@/server/db/repositories/lead-management";

export const metadata: Metadata = { title: "Lead details" };

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireStaff();
  const { id } = await params;
  let lead: Awaited<ReturnType<typeof getLeadDetail>>;
  let staff: Awaited<ReturnType<typeof listStaffChoices>> = [];
  try {
    [lead, staff] = await Promise.all([
      getLeadDetail(user, id, leadManagementRepository),
      user.role === "ADMIN" ? listStaffChoices(user, leadManagementRepository) : Promise.resolve([]),
    ]);
  } catch {
    return <p role="alert" className="rounded-2xl border border-line bg-white p-8 text-sm text-muted">This lead could not be loaded right now. Please try again.</p>;
  }
  if (!lead) notFound();

  return (
    <>
      <Link href="/admin/leads" className="text-sm font-semibold text-sea underline-offset-4 hover:underline">← Back to leads</Link>
      <div className="mt-7 flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">Dashboard / Lead details</p><h1 className="mt-3 break-words text-4xl font-semibold tracking-[-0.055em]">{lead.name}</h1><p className="mt-2 break-all text-sm text-muted">{lead.email}</p></div>
        <LeadStatusBadge status={lead.status} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
        <div className="space-y-6">
          <section aria-labelledby="enquiry-heading" className="rounded-2xl border border-line bg-white p-6 sm:p-8">
            <h2 id="enquiry-heading" className="text-xl font-semibold">Enquiry</h2>
            <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-ink">{lead.message}</p>
          </section>
          <section aria-labelledby="notes-heading" className="rounded-2xl border border-line bg-white p-6 sm:p-8">
            <h2 id="notes-heading" className="text-xl font-semibold">Internal notes</h2>
            <p className="mt-1 text-xs text-muted">Only signed-in staff can view these notes.</p>
            <div className="mt-6"><NoteForm leadId={lead.id} /></div>
            <div className="mt-8 space-y-4 border-t border-line pt-6">
              {lead.notes.length === 0 ? <p className="text-sm text-muted">No internal notes yet.</p> : lead.notes.map((note) => (
                <article key={note.id} className="rounded-xl bg-[#f7f9f7] p-4">
                  <p className="whitespace-pre-wrap break-words text-sm leading-6">{note.content}</p>
                  <p className="mt-3 text-xs text-muted">{note.author.name || note.author.email} · <time dateTime={note.createdAt.toISOString()}>{formatLeadDate(note.createdAt)}</time></p>
                </article>
              ))}
            </div>
          </section>
        </div>
        <div className="space-y-6">
          <section aria-labelledby="details-heading" className="rounded-2xl border border-line bg-white p-6">
            <h2 id="details-heading" className="text-xl font-semibold">Details</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Email</dt><dd className="mt-1 break-all">{lead.email}</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Phone</dt><dd className="mt-1">{lead.phone ?? "Not provided"}</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Company</dt><dd className="mt-1">{lead.company ?? "Not provided"}</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Service</dt><dd className="mt-1">{lead.service?.name ?? "General enquiry"}</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Assigned to</dt><dd className="mt-1">{lead.assignedUser ? `${lead.assignedUser.name} (${lead.assignedUser.email})` : "Unassigned"}</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Received</dt><dd className="mt-1"><time dateTime={lead.createdAt.toISOString()}>{formatLeadDate(lead.createdAt)}</time></dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Updated</dt><dd className="mt-1"><time dateTime={lead.updatedAt.toISOString()}>{formatLeadDate(lead.updatedAt)}</time></dd></div>
            </dl>
          </section>
          <section aria-labelledby="status-heading" className="rounded-2xl border border-line bg-white p-6"><h2 id="status-heading" className="mb-5 text-xl font-semibold">Progress</h2><StatusForm leadId={lead.id} currentStatus={lead.status} /></section>
          {user.role === "ADMIN" && <section aria-labelledby="assignment-heading" className="rounded-2xl border border-line bg-white p-6"><h2 id="assignment-heading" className="mb-5 text-xl font-semibold">Assignment</h2><AssignmentForm leadId={lead.id} currentAssigneeId={lead.assignedUser?.id ?? null} staff={staff} /><p className="mt-3 text-xs leading-5 text-muted">Only active ADMIN and STAFF accounts can receive new assignments. Historical assignments remain visible.</p></section>}
        </div>
      </div>
    </>
  );
}
