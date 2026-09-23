import "server-only";

import { assertAdminRole, assertStaffRole } from "@/server/auth/authorization";
import type { StaffIdentity } from "@/server/auth/credentials";
import type { LeadManagementRepository } from "@/server/db/repositories/lead-management";
import { assigneeSchema, leadFiltersSchema, leadIdSchema, leadNoteSchema, leadStatusSchema } from "./validation";

export function parseLeadFilters(raw: unknown) {
  return leadFiltersSchema.safeParse(raw);
}

export async function listLeads(
  user: StaffIdentity, rawFilters: unknown, repository: LeadManagementRepository,
) {
  assertStaffRole(user.role);
  const parsed = leadFiltersSchema.safeParse(rawFilters);
  if (!parsed.success) return null;
  return { filters: parsed.data, ...(await repository.list(parsed.data)) };
}

export async function getLeadDetail(user: StaffIdentity, rawId: unknown, repository: LeadManagementRepository) {
  assertStaffRole(user.role);
  const parsed = leadIdSchema.safeParse(rawId);
  return parsed.success ? repository.detail(parsed.data) : null;
}

export async function listServiceChoices(user: StaffIdentity, repository: LeadManagementRepository) {
  assertStaffRole(user.role);
  return repository.services();
}

export async function listStaffChoices(user: StaffIdentity, repository: LeadManagementRepository) {
  assertAdminRole(user.role);
  return repository.staff();
}

export async function changeLeadStatus(
  user: StaffIdentity, rawId: unknown, rawStatus: unknown, repository: LeadManagementRepository,
) {
  assertStaffRole(user.role);
  const id = leadIdSchema.safeParse(rawId);
  const status = leadStatusSchema.safeParse(rawStatus);
  if (!id.success || !status.success) return { status: "invalid" as const, message: "Choose a valid status." };
  return await repository.updateStatus(id.data, status.data)
    ? { status: "success" as const }
    : { status: "notFound" as const };
}

export async function writeLeadNote(
  user: StaffIdentity, rawId: unknown, rawContent: unknown, repository: LeadManagementRepository,
) {
  assertStaffRole(user.role);
  const id = leadIdSchema.safeParse(rawId);
  const content = leadNoteSchema.safeParse(rawContent);
  if (!id.success || !content.success) {
    return { status: "invalid" as const, message: content.success ? "Invalid lead." : content.error.issues[0].message };
  }
  if (!(await repository.leadExists(id.data))) return { status: "notFound" as const };
  await repository.addNote(id.data, user.id, content.data);
  return { status: "success" as const };
}

export async function assignLead(
  user: StaffIdentity, rawId: unknown, rawAssignee: unknown, repository: LeadManagementRepository,
) {
  assertAdminRole(user.role);
  const id = leadIdSchema.safeParse(rawId);
  const assignee = assigneeSchema.safeParse(rawAssignee);
  if (!id.success || !assignee.success) {
    return { status: "invalid" as const, message: "Choose an available staff member." };
  }
  const assignedUserId = assignee.data || null;
  if (assignedUserId && !(await repository.assignableUserExists(assignedUserId))) {
    return { status: "invalid" as const, message: "Choose an available staff member." };
  }
  return await repository.assign(id.data, assignedUserId)
    ? { status: "success" as const }
    : { status: "notFound" as const };
}
