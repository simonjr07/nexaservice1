"use server";

import { revalidatePath } from "next/cache";
import { createService, editService, changeServicePublication } from "@/features/services/manage-services";
import type { ServiceActionState } from "@/features/services/validation";
import { requireAdmin } from "@/server/auth/authorization";
import { serviceRepository } from "@/server/db/repositories/services";

function formInput(formData: FormData) {
  const publicationValues = formData.getAll("published");
  return {
    name: formData.get("name"), slug: formData.get("slug"),
    shortDescription: formData.get("shortDescription"), description: formData.get("description"),
    published: publicationValues.length === 0 ? false : publicationValues.length === 1 && publicationValues[0] === "on" ? true : publicationValues[0],
  };
}

function refreshServiceViews(slugs: string[] = []) {
  revalidatePath("/admin/services");
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/contact");
  for (const slug of slugs) revalidatePath(`/services/${slug}`);
}

export async function createServiceAction(_previous: ServiceActionState, formData: FormData): Promise<ServiceActionState> {
  const user = await requireAdmin();
  try {
    const result = await createService(user, formInput(formData), serviceRepository);
    if (result.status === "success") refreshServiceViews();
    return result;
  } catch {
    return { status: "error" };
  }
}

export async function editServiceAction(id: string, _previous: ServiceActionState, formData: FormData): Promise<ServiceActionState> {
  const user = await requireAdmin();
  try {
    const before = await serviceRepository.findAdmin(id);
    const result = await editService(user, id, formInput(formData), serviceRepository);
    if (result.status === "success") {
      const after = await serviceRepository.findAdmin(id);
      refreshServiceViews([before?.slug, after?.slug].filter((slug): slug is string => !!slug));
      revalidatePath(`/admin/services/${id}/edit`);
    }
    return result;
  } catch {
    return { status: "error" };
  }
}

export async function setServicePublicationAction(id: string, published: boolean, _previous: ServiceActionState): Promise<ServiceActionState> {
  const user = await requireAdmin();
  void _previous;
  try {
    const current = await serviceRepository.findAdmin(id);
    const result = await changeServicePublication(user, id, published, serviceRepository);
    if (result.status === "success") refreshServiceViews(current ? [current.slug] : []);
    return result;
  } catch {
    return { status: "error" };
  }
}
