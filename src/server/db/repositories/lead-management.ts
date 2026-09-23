import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { prisma } from "@/server/db/client";
import type { LeadFilters, LeadStatus } from "@/features/leads/validation";

export const LEAD_PAGE_SIZE = 50;

export type LeadListItem = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  status: LeadStatus;
  createdAt: Date;
  service: { name: string } | null;
  assignedUser: { id: string; name: string; email: string } | null;
};

export type LeadDetail = LeadListItem & {
  phone: string | null;
  message: string;
  updatedAt: Date;
  notes: Array<{
    id: string;
    content: string;
    createdAt: Date;
    author: { name: string; email: string };
  }>;
};

export type Choice = { id: string; name: string };
export type StaffChoice = Choice & { email: string };

export type LeadManagementRepository = {
  list(filters: LeadFilters): Promise<{ items: LeadListItem[]; hasNext: boolean }>;
  detail(id: string): Promise<LeadDetail | null>;
  services(): Promise<Choice[]>;
  staff(): Promise<StaffChoice[]>;
  leadExists(id: string): Promise<boolean>;
  assignableUserExists(id: string): Promise<boolean>;
  updateStatus(id: string, status: LeadStatus): Promise<boolean>;
  addNote(leadId: string, authorId: string, content: string): Promise<void>;
  assign(id: string, assignedUserId: string | null): Promise<boolean>;
};

export function createLeadManagementRepository(
  db: Pick<PrismaClient, "lead" | "leadNote" | "service" | "user">,
): LeadManagementRepository {
  return {
    async list(filters) {
      const { q, status, serviceId, page } = filters;
      const rows = await db.lead.findMany({
        where: {
          ...(status ? { status } : {}),
          ...(serviceId ? { serviceId } : {}),
          ...(q ? { OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { company: { contains: q, mode: "insensitive" } },
          ] as const } : {}),
        },
        select: {
          id: true, name: true, email: true, company: true, status: true, createdAt: true,
          service: { select: { name: true } },
          assignedUser: { select: { id: true, name: true, email: true } },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * LEAD_PAGE_SIZE,
        take: LEAD_PAGE_SIZE + 1,
      });
      return { items: rows.slice(0, LEAD_PAGE_SIZE), hasNext: rows.length > LEAD_PAGE_SIZE };
    },
    detail(id) {
      return db.lead.findUnique({
        where: { id },
        select: {
          id: true, name: true, email: true, phone: true, company: true, message: true,
          status: true, createdAt: true, updatedAt: true,
          service: { select: { name: true } },
          assignedUser: { select: { id: true, name: true, email: true } },
          notes: {
            select: { id: true, content: true, createdAt: true, author: { select: { name: true, email: true } } },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          },
        },
      });
    },
    services: () => db.service.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    staff: () => db.user.findMany({
      where: { role: { in: ["ADMIN", "STAFF"] } },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    async leadExists(id) {
      return (await db.lead.findUnique({ where: { id }, select: { id: true } })) !== null;
    },
    async assignableUserExists(id) {
      return (await db.user.findFirst({
        where: { id, role: { in: ["ADMIN", "STAFF"] } }, select: { id: true },
      })) !== null;
    },
    async updateStatus(id, status) {
      const result = await db.lead.updateMany({ where: { id }, data: { status } });
      return result.count === 1;
    },
    async addNote(leadId, authorId, content) {
      await db.leadNote.create({ data: { leadId, authorId, content }, select: { id: true } });
    },
    async assign(id, assignedUserId) {
      const result = await db.lead.updateMany({ where: { id }, data: { assignedUserId } });
      return result.count === 1;
    },
  };
}

export const leadManagementRepository = createLeadManagementRepository(prisma);
