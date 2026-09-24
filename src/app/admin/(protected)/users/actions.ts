"use server";

import { revalidatePath } from "next/cache";
import { changeStaffStatus, createStaff, editStaff } from "@/features/staff/manage-staff";
import type { StaffActionState } from "@/features/staff/validation";
import { requireAdmin } from "@/server/auth/authorization";
import { staffRepository } from "@/server/db/repositories/staff";

function refreshStaffViews(id?: string) {
  revalidatePath("/admin/users");
  revalidatePath("/admin/leads/[id]", "page");
  if (id) revalidatePath(`/admin/users/${id}/edit`);
}

export async function createStaffAction(_previous: StaffActionState, formData: FormData): Promise<StaffActionState> {
  const user = await requireAdmin();
  try {
    const result = await createStaff(user, {
      name: formData.get("name"), email: formData.get("email"),
      role: formData.get("role"), password: formData.get("password"),
    }, staffRepository);
    if (result.status === "success") refreshStaffViews();
    return result;
  } catch {
    return { status: "error" };
  }
}

export async function editStaffAction(id: string, _previous: StaffActionState, formData: FormData): Promise<StaffActionState> {
  const user = await requireAdmin();
  try {
    const result = await editStaff(user, id, {
      name: formData.get("name"), email: formData.get("email"), role: formData.get("role"),
    }, staffRepository);
    if (result.status === "success") refreshStaffViews(id);
    return result;
  } catch {
    return { status: "error" };
  }
}

export async function setStaffStatusAction(id: string, status: unknown, _previous: StaffActionState): Promise<StaffActionState> {
  const user = await requireAdmin();
  void _previous;
  try {
    const result = await changeStaffStatus(user, id, status, staffRepository);
    if (result.status === "success") refreshStaffViews(id);
    return result;
  } catch {
    return { status: "error" };
  }
}
