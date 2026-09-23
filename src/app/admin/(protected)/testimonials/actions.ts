"use server";

import { revalidatePath } from "next/cache";
import { changeTestimonialPublication, createTestimonial, editTestimonial } from "@/features/website-content/manage-content";
import type { ContentActionState, TestimonialField } from "@/features/website-content/validation";
import { requireAdmin } from "@/server/auth/authorization";
import { websiteContentRepository } from "@/server/db/repositories/website-content";

type ActionState = ContentActionState<TestimonialField>;

function input(formData: FormData) {
  const values = formData.getAll("published");
  return {
    customerName: formData.get("customerName"), company: formData.get("company"), content: formData.get("content"),
    published: values.length === 0 ? false : values.length === 1 && values[0] === "on" ? true : values[0],
  };
}

function refresh() {
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

export async function createTestimonialAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  try {
    const result = await createTestimonial(user, input(formData), websiteContentRepository);
    if (result.status === "success") refresh();
    return result;
  } catch {
    return { status: "error" };
  }
}

export async function editTestimonialAction(id: string, _previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  try {
    const result = await editTestimonial(user, id, input(formData), websiteContentRepository);
    if (result.status === "success") {
      refresh();
      revalidatePath(`/admin/testimonials/${id}/edit`);
    }
    return result;
  } catch {
    return { status: "error" };
  }
}

export async function setTestimonialPublicationAction(id: string, published: boolean, _previous: ActionState): Promise<ActionState> {
  const user = await requireAdmin();
  void _previous;
  try {
    const result = await changeTestimonialPublication(user, id, published, websiteContentRepository);
    if (result.status === "success") refresh();
    return result;
  } catch {
    return { status: "error" };
  }
}
