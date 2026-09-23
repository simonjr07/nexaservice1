import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { ServiceInput } from "@/features/services/validation";
import { prisma } from "@/server/db/client";

export type ServiceRecord = ServiceInput & { id: string; createdAt: Date; updatedAt: Date };
export type PublicService = Pick<ServiceRecord, "id" | "name" | "slug" | "shortDescription" | "description">;

export type ServiceRepository = {
  listAll(): Promise<ServiceRecord[]>;
  findAdmin(id: string): Promise<ServiceRecord | null>;
  listPublished(): Promise<Pick<PublicService, "id" | "name" | "slug" | "shortDescription">[]>;
  findPublished(slug: string): Promise<PublicService | null>;
  slugExists(slug: string, exceptId?: string): Promise<boolean>;
  create(data: ServiceInput): Promise<{ id: string }>;
  update(id: string, data: ServiceInput): Promise<boolean>;
  setPublished(id: string, published: boolean): Promise<boolean>;
};

const allFields = {
  id: true, name: true, slug: true, shortDescription: true, description: true,
  published: true, createdAt: true, updatedAt: true,
} as const;

export function createServiceRepository(db: Pick<PrismaClient, "service">): ServiceRepository {
  return {
    listAll: () => db.service.findMany({ select: allFields, orderBy: [{ createdAt: "desc" }, { id: "desc" }] }),
    findAdmin: (id) => db.service.findUnique({ where: { id }, select: allFields }),
    listPublished: () => db.service.findMany({
      where: { published: true },
      select: { id: true, name: true, slug: true, shortDescription: true },
      orderBy: [{ name: "asc" }, { id: "asc" }],
    }),
    findPublished: (slug) => db.service.findFirst({
      where: { slug, published: true },
      select: { id: true, name: true, slug: true, shortDescription: true, description: true },
    }),
    async slugExists(slug, exceptId) {
      return (await db.service.findFirst({
        where: { slug, ...(exceptId ? { id: { not: exceptId } } : {}) }, select: { id: true },
      })) !== null;
    },
    create: (data) => db.service.create({ data, select: { id: true } }),
    async update(id, data) {
      return (await db.service.updateMany({ where: { id }, data })).count === 1;
    },
    async setPublished(id, published) {
      return (await db.service.updateMany({ where: { id }, data: { published } })).count === 1;
    },
  };
}

export const serviceRepository = createServiceRepository(prisma);
