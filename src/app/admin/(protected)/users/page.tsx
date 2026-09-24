import type { Metadata } from "next";
import Link from "next/link";
import { StaffStatusForm } from "@/components/dashboard/staff-status-form";
import { listStaff } from "@/features/staff/manage-staff";
import { requireAdmin } from "@/server/auth/authorization";
import { staffRepository } from "@/server/db/repositories/staff";
import { setStaffStatusAction } from "./actions";

export const metadata: Metadata = { title: "Manage staff" };

export default async function StaffPage() {
  const admin = await requireAdmin();
  let accounts: Awaited<ReturnType<typeof listStaff>>;
  try {
    accounts = await listStaff(admin, staffRepository);
  } catch {
    return <p role="alert" className="rounded-2xl border border-line bg-white p-8 text-sm text-muted">Staff accounts could not be loaded. Please try again.</p>;
  }
  return <>
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">Dashboard / Users</p>
    <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
      <div><h1 className="text-4xl font-semibold tracking-[-0.055em]">Staff accounts</h1><p className="mt-3 text-sm leading-6 text-muted">Create and manage internal access. Disabled accounts retain their historical Lead assignments and notes.</p></div>
      <Link href="/admin/users/new" className="inline-flex min-h-11 items-center rounded-full bg-deep px-5 text-sm font-semibold text-white hover:bg-sea focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea">Create staff ↗</Link>
    </div>
    {accounts.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-[#c7d5cf] bg-white p-10"><h2 className="text-xl font-semibold">No staff accounts</h2><p className="mt-2 text-sm text-muted">Create an internal account to grant dashboard access.</p></div> :
      <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-white"><table className="min-w-[800px] w-full border-collapse text-left text-sm">
        <thead className="bg-[#f7f9f7] text-xs font-semibold uppercase tracking-[0.08em] text-muted"><tr><th scope="col" className="px-5 py-4">Staff</th><th scope="col" className="px-5 py-4">Role</th><th scope="col" className="px-5 py-4">Status</th><th scope="col" className="px-5 py-4">Created</th><th scope="col" className="px-5 py-4">Actions</th></tr></thead>
        <tbody className="divide-y divide-line">{accounts.map((person) => <tr key={person.id} className="align-top">
          <th scope="row" className="px-5 py-4 font-normal"><Link href={`/admin/users/${person.id}/edit`} className="font-semibold text-ink hover:text-sea hover:underline">{person.name}</Link><span className="mt-1 block break-all text-xs text-muted">{person.email}</span></th>
          <td className="px-5 py-4">{person.role}</td>
          <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${person.status === "ACTIVE" ? "bg-[#eaf0e8] text-sea" : "bg-[#f0f2f0] text-muted"}`}>{person.status === "ACTIVE" ? "Active" : "Disabled"}</span></td>
          <td className="px-5 py-4 text-muted"><time dateTime={person.createdAt.toISOString()}>{person.createdAt.toLocaleDateString("en-GB")}</time></td>
          <td className="px-5 py-4"><div className="flex items-start gap-4"><Link href={`/admin/users/${person.id}/edit`} className="text-sm font-semibold text-sea hover:underline">Edit</Link><StaffStatusForm name={person.name} status={person.status} self={person.id === admin.id} action={setStaffStatusAction.bind(null, person.id, person.status === "ACTIVE" ? "DISABLED" : "ACTIVE")} /></div></td>
        </tr>)}</tbody>
      </table></div>}
  </>;
}
