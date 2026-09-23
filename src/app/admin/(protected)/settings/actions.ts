"use server";

import { revalidatePath } from "next/cache";
import { updateSettings } from "@/features/website-content/manage-content";
import type { ContentActionState, SettingsField } from "@/features/website-content/validation";
import { requireAdmin } from "@/server/auth/authorization";
import { websiteContentRepository } from "@/server/db/repositories/website-content";

export async function saveSettingsAction(_previous: ContentActionState<SettingsField>, formData: FormData): Promise<ContentActionState<SettingsField>> {
  const user = await requireAdmin();
  try {
    const result = await updateSettings(user, {
      businessName: formData.get("businessName"), email: formData.get("email"),
      phone: formData.get("phone"), address: formData.get("address"),
    }, websiteContentRepository);
    if (result.status === "success") {
      revalidatePath("/admin/settings");
      revalidatePath("/", "layout");
    }
    return result;
  } catch {
    return { status: "error" };
  }
}
