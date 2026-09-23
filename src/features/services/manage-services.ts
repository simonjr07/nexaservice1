import "server-only";

import { assertAdminRole } from "@/server/auth/authorization";
import type { StaffIdentity } from "@/server/auth/credentials";
import type { ServiceRepository } from "@/server/db/repositories/services";
import { serviceIdSchema, serviceInputSchema, type ServiceActionState } from "./validation";

function validate(raw: unknown): { data: ReturnType<typeof serviceInputSchema.parse> } | { error: ServiceActionState } {
  const result = serviceInputSchema.safeParse(raw);
  if (result.success) return { data: result.data };
  const fieldErrors: NonNullable<ServiceActionState["fieldErrors"]> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof typeof fieldErrors;
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  return { error: { status: "invalid", fieldErrors } };
}

export function isUniqueSlugError(error: unknown): boolean {
  return !!error && typeof error === "object" && "code" in error && error.code === "P2002";
}

export async function listAdminServices(user: StaffIdentity, repository: ServiceRepository) {
  assertAdminRole(user.role);
  return repository.listAll();
}

export async function getAdminService(user: StaffIdentity, rawId: unknown, repository: ServiceRepository) {
  assertAdminRole(user.role);
  const id = serviceIdSchema.safeParse(rawId);
  return id.success ? repository.findAdmin(id.data) : null;
}

export async function createService(user: StaffIdentity, raw: unknown, repository: ServiceRepository): Promise<ServiceActionState> {
  assertAdminRole(user.role);
  const parsed = validate(raw);
  if ("error" in parsed) return parsed.error;
  if (await repository.slugExists(parsed.data.slug)) return { status: "duplicate", fieldErrors: { slug: "This slug is already in use." } };
  try {
    const created = await repository.create(parsed.data);
    return { status: "success", id: created.id };
  } catch (error) {
    if (isUniqueSlugError(error)) return { status: "duplicate", fieldErrors: { slug: "This slug is already in use." } };
    throw error;
  }
}

export async function editService(user: StaffIdentity, rawId: unknown, raw: unknown, repository: ServiceRepository): Promise<ServiceActionState> {
  assertAdminRole(user.role);
  const id = serviceIdSchema.safeParse(rawId);
  if (!id.success) return { status: "notFound" };
  const parsed = validate(raw);
  if ("error" in parsed) return parsed.error;
  if (!(await repository.findAdmin(id.data))) return { status: "notFound" };
  if (await repository.slugExists(parsed.data.slug, id.data)) return { status: "duplicate", fieldErrors: { slug: "This slug is already in use." } };
  try {
    return await repository.update(id.data, parsed.data) ? { status: "success", id: id.data } : { status: "notFound" };
  } catch (error) {
    if (isUniqueSlugError(error)) return { status: "duplicate", fieldErrors: { slug: "This slug is already in use." } };
    throw error;
  }
}

export async function changeServicePublication(user: StaffIdentity, rawId: unknown, rawPublished: unknown, repository: ServiceRepository): Promise<ServiceActionState> {
  assertAdminRole(user.role);
  const id = serviceIdSchema.safeParse(rawId);
  if (!id.success || typeof rawPublished !== "boolean") return { status: "invalid" };
  return await repository.setPublished(id.data, rawPublished) ? { status: "success", id: id.data } : { status: "notFound" };
}
