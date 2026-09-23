import "server-only";

import { cache } from "react";
import { assertAdminRole } from "@/server/auth/authorization";
import type { StaffIdentity } from "@/server/auth/credentials";
import { websiteContentRepository, type WebsiteContentRepository } from "@/server/db/repositories/website-content";
import { fieldErrors, settingsInputSchema, testimonialIdSchema, testimonialInputSchema, type ContentActionState, type SettingsField, type TestimonialField } from "./validation";

export const publicSettingsFallback = { businessName: "NexaService", email: "", phone: "", address: "" };

export const getPublicSettings = cache(async () => {
  const stored = await websiteContentRepository.getSettings();
  return stored ? { businessName: stored.businessName, email: stored.email, phone: stored.phone, address: stored.address } : publicSettingsFallback;
});

export async function listPublishedTestimonials(repository: WebsiteContentRepository = websiteContentRepository) {
  return repository.listPublishedTestimonials();
}

export async function listAdminTestimonials(user: StaffIdentity, repository: WebsiteContentRepository) {
  assertAdminRole(user.role);
  return repository.listTestimonials();
}

export async function getAdminTestimonial(user: StaffIdentity, rawId: unknown, repository: WebsiteContentRepository) {
  assertAdminRole(user.role);
  const id = testimonialIdSchema.safeParse(rawId);
  return id.success ? repository.findTestimonial(id.data) : null;
}

export async function createTestimonial(user: StaffIdentity, raw: unknown, repository: WebsiteContentRepository): Promise<ContentActionState<TestimonialField>> {
  assertAdminRole(user.role);
  const parsed = testimonialInputSchema.safeParse(raw);
  if (!parsed.success) return { status: "invalid", fieldErrors: fieldErrors(parsed.error.issues) };
  const created = await repository.createTestimonial(parsed.data);
  return { status: "success", id: created.id };
}

export async function editTestimonial(user: StaffIdentity, rawId: unknown, raw: unknown, repository: WebsiteContentRepository): Promise<ContentActionState<TestimonialField>> {
  assertAdminRole(user.role);
  const id = testimonialIdSchema.safeParse(rawId);
  if (!id.success) return { status: "notFound" };
  const parsed = testimonialInputSchema.safeParse(raw);
  if (!parsed.success) return { status: "invalid", fieldErrors: fieldErrors(parsed.error.issues) };
  return await repository.updateTestimonial(id.data, parsed.data) ? { status: "success", id: id.data } : { status: "notFound" };
}

export async function changeTestimonialPublication(user: StaffIdentity, rawId: unknown, rawPublished: unknown, repository: WebsiteContentRepository): Promise<ContentActionState<TestimonialField>> {
  assertAdminRole(user.role);
  const id = testimonialIdSchema.safeParse(rawId);
  if (!id.success || typeof rawPublished !== "boolean") return { status: "invalid" };
  return await repository.setTestimonialPublished(id.data, rawPublished) ? { status: "success", id: id.data } : { status: "notFound" };
}

export async function getAdminSettings(user: StaffIdentity, repository: WebsiteContentRepository) {
  assertAdminRole(user.role);
  return repository.getSettings();
}

export async function updateSettings(user: StaffIdentity, raw: unknown, repository: WebsiteContentRepository): Promise<ContentActionState<SettingsField>> {
  assertAdminRole(user.role);
  const parsed = settingsInputSchema.safeParse(raw);
  if (!parsed.success) return { status: "invalid", fieldErrors: fieldErrors(parsed.error.issues) };
  await repository.saveSettings(parsed.data);
  return { status: "success" };
}
