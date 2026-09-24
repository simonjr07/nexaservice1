import "server-only";

import { hash } from "bcryptjs";
import { assertAdminRole } from "@/server/auth/authorization";
import type { StaffIdentity } from "@/server/auth/credentials";
import type { StaffRepository } from "@/server/db/repositories/staff";
import { accountStatusSchema, createStaffSchema, editStaffSchema, staffIdSchema, type StaffActionState, type StaffField } from "./validation";

function invalid(error: { issues: { path: PropertyKey[]; message: string }[] }): StaffActionState {
  const fieldErrors: NonNullable<StaffActionState["fieldErrors"]> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as StaffField;
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  return { status: "invalid", fieldErrors };
}

function duplicateEmail(error: unknown) {
  return !!error && typeof error === "object" && "code" in error && error.code === "P2002";
}

export async function listStaff(user: StaffIdentity, repository: StaffRepository) {
  assertAdminRole(user.role);
  return repository.list();
}

export async function getStaff(user: StaffIdentity, rawId: unknown, repository: StaffRepository) {
  assertAdminRole(user.role);
  const id = staffIdSchema.safeParse(rawId);
  return id.success ? repository.find(id.data) : null;
}

export async function createStaff(user: StaffIdentity, raw: unknown, repository: StaffRepository): Promise<StaffActionState> {
  assertAdminRole(user.role);
  const parsed = createStaffSchema.safeParse(raw);
  if (!parsed.success) return invalid(parsed.error);
  const { password, ...details } = parsed.data;
  try {
    const result = await repository.create(user.id, { ...details, passwordHash: await hash(password, 12) });
    return result.status === "duplicate" ? { status: "duplicate", fieldErrors: { email: "This email is already in use." } } : result;
  } catch (error) {
    if (duplicateEmail(error)) return { status: "duplicate", fieldErrors: { email: "This email is already in use." } };
    throw error;
  }
}

export async function editStaff(user: StaffIdentity, rawId: unknown, raw: unknown, repository: StaffRepository): Promise<StaffActionState> {
  assertAdminRole(user.role);
  const id = staffIdSchema.safeParse(rawId);
  if (!id.success) return { status: "notFound" };
  const parsed = editStaffSchema.safeParse(raw);
  if (!parsed.success) return invalid(parsed.error);
  try {
    const status = await repository.edit(user.id, id.data, parsed.data);
    return status === "duplicate" ? { status, fieldErrors: { email: "This email is already in use." } } : { status, id: status === "success" ? id.data : undefined };
  } catch (error) {
    if (duplicateEmail(error)) return { status: "duplicate", fieldErrors: { email: "This email is already in use." } };
    throw error;
  }
}

export async function changeStaffStatus(user: StaffIdentity, rawId: unknown, rawStatus: unknown, repository: StaffRepository): Promise<StaffActionState> {
  assertAdminRole(user.role);
  const id = staffIdSchema.safeParse(rawId);
  if (!id.success) return { status: "notFound" };
  const status = accountStatusSchema.safeParse(rawStatus);
  if (!status.success) return { status: "invalid", fieldErrors: { status: "Choose a valid account status." } };
  const result = await repository.setStatus(user.id, id.data, status.data);
  return { status: result, id: result === "success" ? id.data : undefined };
}
