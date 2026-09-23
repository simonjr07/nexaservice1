import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { prisma } from "@/server/db/client";

export type PublishedServiceOption = { id: string; name: string };
export type NewLeadData = {
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  serviceId: string | null;
};

export type LeadIntakeRepository = {
  listPublishedServices(): Promise<PublishedServiceOption[]>;
  isPublishedService(id: string): Promise<boolean>;
  createLead(data: NewLeadData): Promise<void>;
};

export function createLeadIntakeRepository(db: Pick<PrismaClient, "service" | "lead">): LeadIntakeRepository {
  return {
    listPublishedServices: () => db.service.findMany({
      where: { published: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    async isPublishedService(id) {
      const service = await db.service.findFirst({ where: { id, published: true }, select: { id: true } });
      return service !== null;
    },
    async createLead(data) {
      await db.lead.create({
        data: { ...data, status: "NEW", assignedUserId: null },
        select: { id: true },
      });
    },
  };
}

export const leadIntakeRepository = createLeadIntakeRepository(prisma);
