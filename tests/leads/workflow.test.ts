import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSession, findUnique, redirect, notFound, revalidatePath, repository } = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  findUnique: vi.fn(),
  redirect: vi.fn((path: string) => { throw new Error(`REDIRECT:${path}`); }),
  notFound: vi.fn(() => { throw new Error("NOT_FOUND"); }),
  revalidatePath: vi.fn(),
  repository: {
    list: vi.fn(), detail: vi.fn(), services: vi.fn(), staff: vi.fn(),
    leadExists: vi.fn(), assignableUserExists: vi.fn(), updateStatus: vi.fn(),
    addNote: vi.fn(), assign: vi.fn(),
  },
}));

vi.mock("next-auth", () => ({ getServerSession }));
vi.mock("next/navigation", () => ({ redirect, notFound }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/server/db/client", () => ({ prisma: { user: { findUnique } } }));
vi.mock("@/server/db/repositories/lead-management", () => ({ leadManagementRepository: repository }));

import LeadsPage from "@/app/admin/(protected)/leads/page";
import LeadDetailPage from "@/app/admin/(protected)/leads/[id]/page";
import { addLeadNote, setLeadAssignee, updateLeadStatus } from "@/app/admin/(protected)/leads/[id]/actions";
import { initialLeadActionState } from "@/features/leads/validation";

const userId = "1380de89-e26f-4e8b-a90d-5309a627f6bd";
const leadId = "7e7c41a8-115f-4782-9541-5a1292d5a4af";
const assigneeId = "d4728292-f250-4d88-8e2e-f72716c30524";
const user = { id: userId, name: "Staff Example", email: "staff@example.test", role: "STAFF" };

function data(name: string, value: string) {
  const form = new FormData();
  form.set(name, value);
  return form;
}

beforeEach(() => {
  vi.clearAllMocks();
  getServerSession.mockResolvedValue({ user: { id: userId } });
  findUnique.mockResolvedValue(user);
  repository.list.mockResolvedValue({ items: [], hasNext: false });
  repository.detail.mockResolvedValue(null);
  repository.services.mockResolvedValue([]);
  repository.staff.mockResolvedValue([]);
  repository.leadExists.mockResolvedValue(true);
  repository.assignableUserExists.mockResolvedValue(true);
  repository.updateStatus.mockResolvedValue(true);
  repository.addNote.mockResolvedValue(undefined);
  repository.assign.mockResolvedValue(true);
});

describe("protected lead workflow", () => {
  it("allows STAFF and ADMIN to load the lead list with validated filters", async () => {
    await LeadsPage({ searchParams: Promise.resolve({ q: "  Example  ", status: "NEW" }) });
    expect(repository.list).toHaveBeenCalledWith({ q: "Example", status: "NEW", page: 1 });
    findUnique.mockResolvedValue({ ...user, role: "ADMIN" });
    await LeadsPage({ searchParams: Promise.resolve({}) });
    expect(repository.list).toHaveBeenCalledTimes(2);
  });

  it("rejects unauthenticated list, detail, and mutation access before any lead query", async () => {
    getServerSession.mockResolvedValue(null);
    await expect(LeadsPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("REDIRECT:/admin/login");
    await expect(LeadDetailPage({ params: Promise.resolve({ id: leadId }) })).rejects.toThrow("REDIRECT:/admin/login");
    await expect(addLeadNote(leadId, initialLeadActionState, data("content", "Private note"))).rejects.toThrow("REDIRECT:/admin/login");
    expect(repository.list).not.toHaveBeenCalled();
    expect(repository.detail).not.toHaveBeenCalled();
    expect(repository.addNote).not.toHaveBeenCalled();
  });

  it("retrieves lead detail only through the protected page and handles unknown IDs", async () => {
    const detail = {
      id: leadId, name: "Visitor", email: "visitor@example.test", phone: null, company: null,
      message: "A test enquiry", status: "NEW", service: null, assignedUser: null, notes: [],
      createdAt: new Date("2026-09-23T12:00:00.000Z"), updatedAt: new Date("2026-09-23T12:00:00.000Z"),
    };
    repository.detail.mockResolvedValueOnce(detail).mockResolvedValueOnce(null);
    await LeadDetailPage({ params: Promise.resolve({ id: leadId }) });
    expect(repository.detail).toHaveBeenCalledWith(leadId);
    await expect(LeadDetailPage({ params: Promise.resolve({ id: leadId }) })).rejects.toThrow("NOT_FOUND");
  });

  it("lets STAFF change status but rejects invalid values", async () => {
    await expect(updateLeadStatus(leadId, initialLeadActionState, data("status", "QUALIFIED"))).resolves.toEqual({ status: "success" });
    expect(repository.updateStatus).toHaveBeenCalledWith(leadId, "QUALIFIED");
    expect(revalidatePath).toHaveBeenCalledWith(`/admin/leads/${leadId}`);
    await expect(updateLeadStatus(leadId, initialLeadActionState, data("status", "SECRET"))).resolves.toMatchObject({ status: "invalid" });
    expect(repository.updateStatus).toHaveBeenCalledTimes(1);
  });

  it("takes note author from the authenticated user, not submitted form data", async () => {
    const form = data("content", "  Follow up tomorrow.  ");
    form.set("authorId", assigneeId);
    await expect(addLeadNote(leadId, initialLeadActionState, form)).resolves.toEqual({ status: "success" });
    expect(repository.addNote).toHaveBeenCalledWith(leadId, userId, "Follow up tomorrow.");
    await expect(addLeadNote(leadId, initialLeadActionState, data("content", " "))).resolves.toMatchObject({ status: "invalid" });
    expect(repository.addNote).toHaveBeenCalledTimes(1);
  });

  it("denies STAFF assignment server-side and allows ADMIN assignment", async () => {
    await expect(setLeadAssignee(leadId, initialLeadActionState, data("assignedUserId", assigneeId))).resolves.toEqual({ status: "forbidden" });
    expect(repository.assign).not.toHaveBeenCalled();
    findUnique.mockResolvedValue({ ...user, role: "ADMIN" });
    await expect(setLeadAssignee(leadId, initialLeadActionState, data("assignedUserId", assigneeId))).resolves.toEqual({ status: "success" });
    expect(repository.assignableUserExists).toHaveBeenCalledWith(assigneeId);
    expect(repository.assign).toHaveBeenCalledWith(leadId, assigneeId);
  });

  it("returns safe errors on failed mutations", async () => {
    repository.updateStatus.mockRejectedValue(new Error("private database details"));
    await expect(updateLeadStatus(leadId, initialLeadActionState, data("status", "WON"))).resolves.toEqual({ status: "error" });
  });
});
