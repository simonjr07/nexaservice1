"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { StaffRecord } from "@/server/db/repositories/staff";
import type { StaffActionState } from "@/features/staff/validation";

const inputClass = "mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus-visible:border-sea focus-visible:ring-2 focus-visible:ring-sea/20";
const initialStaffActionState: StaffActionState = { status: "idle" };

export function StaffForm({ action, staff }: {
  action: (state: StaffActionState, data: FormData) => Promise<StaffActionState>;
  staff?: StaffRecord;
}) {
  const [state, formAction, pending] = useActionState(action, initialStaffActionState);
  const errors = state.fieldErrors ?? {};
  return <form action={formAction} noValidate className="mt-8 max-w-3xl space-y-6 rounded-2xl border border-line bg-white p-6 sm:p-8">
    <div><label htmlFor="staff-name" className="block text-sm font-semibold">Name <span aria-hidden="true" className="text-sea">*</span></label><input id="staff-name" name="name" required maxLength={120} defaultValue={staff?.name ?? ""} aria-invalid={!!errors.name} aria-describedby={errors.name ? "staff-name-error" : undefined} className={inputClass} />{errors.name && <p id="staff-name-error" className="mt-2 text-sm text-red-800">{errors.name}</p>}</div>
    <div><label htmlFor="staff-email" className="block text-sm font-semibold">Email <span aria-hidden="true" className="text-sea">*</span></label><input id="staff-email" name="email" type="email" required maxLength={254} autoComplete="off" defaultValue={staff?.email ?? ""} aria-invalid={!!errors.email} aria-describedby={errors.email ? "staff-email-error" : undefined} className={inputClass} />{errors.email && <p id="staff-email-error" className="mt-2 text-sm text-red-800">{errors.email}</p>}</div>
    {!staff && <div><label htmlFor="staff-password" className="block text-sm font-semibold">Initial password <span aria-hidden="true" className="text-sea">*</span></label><input id="staff-password" name="password" type="password" required minLength={12} maxLength={128} autoComplete="new-password" aria-invalid={!!errors.password} aria-describedby={errors.password ? "staff-password-help staff-password-error" : "staff-password-help"} className={inputClass} /><p id="staff-password-help" className="mt-2 text-xs leading-5 text-muted">At least 12 characters and no more than 72 UTF-8 bytes. Share it with the intended staff member through a private channel.</p>{errors.password && <p id="staff-password-error" className="mt-2 text-sm text-red-800">{errors.password}</p>}</div>}
    <div><label htmlFor="staff-role" className="block text-sm font-semibold">Role <span aria-hidden="true" className="text-sea">*</span></label><select id="staff-role" name="role" defaultValue={staff?.role ?? "STAFF"} aria-invalid={!!errors.role} aria-describedby={errors.role ? "staff-role-error" : undefined} className={inputClass}><option value="STAFF">STAFF</option><option value="ADMIN">ADMIN</option></select>{errors.role && <p id="staff-role-error" className="mt-2 text-sm text-red-800">{errors.role}</p>}</div>
    {staff && <p className="text-xs leading-5 text-muted">Password changes are not available here. Account status is managed from the staff list.</p>}
    {state.status === "success" && <p role="status" className="rounded-xl bg-[#eaf0e8] p-4 text-sm text-sea">Account saved. {state.id && !staff && <Link href={`/admin/users/${state.id}/edit`} className="font-semibold underline">Edit account</Link>}</p>}
    {state.status === "self" && <p role="alert" className="text-sm text-red-800">You cannot remove your own ADMIN role.</p>}
    {state.status === "lastAdmin" && <p role="alert" className="text-sm text-red-800">The last active administrator must remain an ADMIN.</p>}
    {state.status === "duplicate" && <p role="alert" className="text-sm text-red-800">This email is already in use.</p>}
    {state.status === "notFound" && <p role="alert" className="text-sm text-red-800">This account is no longer available.</p>}
    {state.status === "forbidden" && <p role="alert" className="text-sm text-red-800">Your administrator access is no longer active.</p>}
    {state.status === "error" && <p role="alert" className="text-sm text-red-800">The account could not be saved. Please try again.</p>}
    <div className="flex flex-wrap items-center gap-5"><button type="submit" disabled={pending} className="min-h-11 rounded-full bg-deep px-6 text-sm font-semibold text-white hover:bg-sea focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea disabled:opacity-60">{pending ? "Saving…" : staff ? "Save changes" : "Create account"}</button><Link href="/admin/users" className="text-sm font-semibold text-sea underline-offset-4 hover:underline">Back to staff</Link></div>
  </form>;
}
