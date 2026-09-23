"use server";

import { revalidatePath } from "next/cache";
import { ForbiddenError, requireStaff } from "@/server/auth/authorization";
import { leadManagementRepository } from "@/server/db/repositories/lead-management";
import { assignLead, changeLeadStatus, writeLeadNote } from "@/features/leads/manage-leads";
import type { LeadActionState } from "@/features/leads/validation";

function refreshLeadViews(id: string) {
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
}

export async function updateLeadStatus(
  id: string, _previous: LeadActionState, formData: FormData,
): Promise<LeadActionState> {
  const user = await requireStaff();
  try {
    const result = await changeLeadStatus(user, id, formData.get("status"), leadManagementRepository);
    if (result.status === "success") refreshLeadViews(id);
    return result;
  } catch {
    return { status: "error" };
  }
}

export async function addLeadNote(
  id: string, _previous: LeadActionState, formData: FormData,
): Promise<LeadActionState> {
  const user = await requireStaff();
  try {
    const result = await writeLeadNote(user, id, formData.get("content"), leadManagementRepository);
    if (result.status === "success") refreshLeadViews(id);
    return result;
  } catch {
    return { status: "error" };
  }
}

export async function setLeadAssignee(
  id: string, _previous: LeadActionState, formData: FormData,
): Promise<LeadActionState> {
  const user = await requireStaff();
  try {
    const result = await assignLead(user, id, formData.get("assignedUserId"), leadManagementRepository);
    if (result.status === "success") refreshLeadViews(id);
    return result;
  } catch (error) {
    if (error instanceof ForbiddenError) return { status: "forbidden" };
    return { status: "error" };
  }
}
