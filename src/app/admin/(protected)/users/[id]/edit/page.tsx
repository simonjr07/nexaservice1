import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StaffForm } from "@/components/dashboard/staff-form";
import { getStaff } from "@/features/staff/manage-staff";
import { requireAdmin } from "@/server/auth/authorization";
import { staffRepository } from "@/server/db/repositories/staff";
import { editStaffAction } from "../../actions";

export const metadata: Metadata = { title: "Edit staff account" };

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  let staff: Awaited<ReturnType<typeof getStaff>>;
  try {
    staff = await getStaff(admin, id, staffRepository);
  } catch {
    return <p role="alert" className="rounded-2xl border border-line bg-white p-8 text-sm text-muted">This account could not be loaded. Please try again.</p>;
  }
  if (!staff) notFound();
  return <>
    <Link href="/admin/users" className="text-sm font-semibold text-sea underline-offset-4 hover:underline">← Back to staff</Link>
    <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-sea">Dashboard / Users</p>
    <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em]">Edit staff account</h1>
    <p className="mt-3 text-sm leading-6 text-muted">Update name, email, or role. Historical records remain associated with this account.</p>
    <StaffForm staff={staff} action={editStaffAction.bind(null, staff.id)} />
  </>;
}
