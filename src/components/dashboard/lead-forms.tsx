"use client";

import { useActionState, useEffect, useRef } from "react";
import { addLeadNote, setLeadAssignee, updateLeadStatus } from "@/app/admin/(protected)/leads/[id]/actions";
import { initialLeadActionState, LEAD_STATUSES, type LeadActionState, type LeadStatus } from "@/features/leads/validation";

const controlClass = "mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink focus-visible:border-sea focus-visible:ring-2 focus-visible:ring-sea/20 disabled:opacity-60";
const buttonClass = "mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-deep px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-sea disabled:cursor-wait disabled:opacity-60";

function Feedback({ state, success }: { state: LeadActionState; success: string }) {
  if (state.status === "idle") return null;
  const message = state.status === "success" ? success
    : state.status === "invalid" ? state.message
      : state.status === "notFound" ? "This lead is no longer available."
        : state.status === "forbidden" ? "You do not have permission to assign leads."
          : "The change could not be saved. Please try again.";
  return <p role={state.status === "success" ? "status" : "alert"} className={`mt-3 text-sm ${state.status === "success" ? "text-sea" : "text-red-800"}`}>{message}</p>;
}

export function StatusForm({ leadId, currentStatus }: { leadId: string; currentStatus: LeadStatus }) {
  const [state, action, pending] = useActionState(updateLeadStatus.bind(null, leadId), initialLeadActionState);
  return (
    <form action={action}>
      <label htmlFor="lead-status" className="block text-sm font-semibold">Lead status</label>
      <select id="lead-status" name="status" key={currentStatus} defaultValue={currentStatus} disabled={pending} className={controlClass}>
        {LEAD_STATUSES.map((status) => <option key={status} value={status}>{status.charAt(0) + status.slice(1).toLowerCase()}</option>)}
      </select>
      <button disabled={pending} className={buttonClass}>{pending ? "Saving…" : "Update status"}</button>
      <Feedback state={state} success="Status updated." />
    </form>
  );
}

export function NoteForm({ leadId }: { leadId: string }) {
  const [state, action, pending] = useActionState(addLeadNote.bind(null, leadId), initialLeadActionState);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);
  return (
    <form ref={formRef} action={action}>
      <label htmlFor="lead-note" className="block text-sm font-semibold">Add an internal note</label>
      <textarea id="lead-note" name="content" rows={4} minLength={2} maxLength={2000} required disabled={pending} className={controlClass} placeholder="Record the next step or useful context for the team." />
      <p className="mt-2 text-xs text-muted">Visible only to signed-in staff.</p>
      <button disabled={pending} className={buttonClass}>{pending ? "Saving…" : "Add note"}</button>
      <Feedback state={state} success="Note added." />
    </form>
  );
}

export function AssignmentForm({
  leadId, currentAssigneeId, staff,
}: { leadId: string; currentAssigneeId: string | null; staff: { id: string; name: string; email: string }[] }) {
  const [state, action, pending] = useActionState(setLeadAssignee.bind(null, leadId), initialLeadActionState);
  return (
    <form action={action}>
      <label htmlFor="lead-assignee" className="block text-sm font-semibold">Assigned staff</label>
      <select id="lead-assignee" name="assignedUserId" key={currentAssigneeId ?? "none"} defaultValue={currentAssigneeId ?? ""} disabled={pending} className={controlClass}>
        <option value="">Unassigned</option>
        {staff.map((person) => <option key={person.id} value={person.id}>{person.name} ({person.email})</option>)}
      </select>
      <button disabled={pending} className={buttonClass}>{pending ? "Saving…" : "Save assignment"}</button>
      <Feedback state={state} success="Assignment updated." />
    </form>
  );
}
