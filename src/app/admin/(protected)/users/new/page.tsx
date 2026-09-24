import type { Metadata } from "next";
import Link from "next/link";
import { StaffForm } from "@/components/dashboard/staff-form";
import { requireAdmin } from "@/server/auth/authorization";
import { createStaffAction } from "../actions";

export const metadata: Metadata = { title: "Create staff account" };

export default async function NewStaffPage() {
  await requireAdmin();
  return <>
    <Link href="/admin/users" className="text-sm font-semibold text-sea underline-offset-4 hover:underline">← Back to staff</Link>
    <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-sea">Dashboard / Users</p>
    <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em]">Create staff account</h1>
    <p className="mt-3 text-sm leading-6 text-muted">Give a named colleague private workspace access. New accounts start active.</p>
    <StaffForm action={createStaffAction} />
  </>;
}
