import "server-only";

import type { AccountStatus, Prisma, PrismaClient, Role } from "@/generated/prisma/client";
import { prisma } from "@/server/db/client";

export type StaffRecord = {
  id: string; name: string; email: string; role: Role; status: AccountStatus;
  createdAt: Date; updatedAt: Date;
};
export type StaffChange = "success" | "notFound" | "self" | "lastAdmin" | "forbidden" | "duplicate";
type StaffTransaction = Pick<Prisma.TransactionClient, "user" | "$queryRaw">;
type TransactionRunner = <T>(callback: (tx: StaffTransaction) => Promise<T>) => Promise<T>;

export type StaffRepository = {
  list(): Promise<StaffRecord[]>;
  find(id: string): Promise<StaffRecord | null>;
  create(actorId: string, data: { name: string; email: string; role: Role; passwordHash: string }): Promise<{ status: StaffChange; id?: string }>;
  edit(actorId: string, id: string, data: { name: string; email: string; role: Role }): Promise<StaffChange>;
  setStatus(actorId: string, id: string, status: AccountStatus): Promise<StaffChange>;
};

const publicStaffFields = { id: true, name: true, email: true, role: true, status: true, createdAt: true, updatedAt: true } as const;

async function lockAndCheckActor(tx: StaffTransaction, actorId: string) {
  // Serialize account changes so two administrators cannot disable each other concurrently.
  await tx.$queryRaw`SELECT 1 AS locked FROM (SELECT pg_advisory_xact_lock(52345, 11)) AS guard`;
  const actor = await tx.user.findUnique({ where: { id: actorId }, select: { role: true, status: true } });
  return actor?.role === "ADMIN" && actor.status === "ACTIVE";
}

export function createStaffRepository(db: Pick<PrismaClient, "user">, inTransaction: TransactionRunner): StaffRepository {
  return {
    list: () => db.user.findMany({ select: publicStaffFields, orderBy: [{ createdAt: "desc" }, { id: "desc" }] }),
    find: (id) => db.user.findUnique({ where: { id }, select: publicStaffFields }),
    create: (actorId, data) => inTransaction(async (tx) => {
      if (!(await lockAndCheckActor(tx, actorId))) return { status: "forbidden" };
      if (await tx.user.findFirst({ where: { email: { equals: data.email, mode: "insensitive" } }, select: { id: true } })) return { status: "duplicate" };
      const created = await tx.user.create({ data: { ...data, status: "ACTIVE" }, select: { id: true } });
      return { status: "success", id: created.id };
    }),
    edit: (actorId, id, data) => inTransaction(async (tx) => {
      if (!(await lockAndCheckActor(tx, actorId))) return "forbidden";
      const target = await tx.user.findUnique({ where: { id }, select: { role: true, status: true } });
      if (!target) return "notFound";
      if (id === actorId && data.role !== "ADMIN") return "self";
      if (target.role === "ADMIN" && target.status === "ACTIVE" && data.role !== "ADMIN") {
        if (await tx.user.count({ where: { role: "ADMIN", status: "ACTIVE" } }) <= 1) return "lastAdmin";
      }
      if (await tx.user.findFirst({ where: { id: { not: id }, email: { equals: data.email, mode: "insensitive" } }, select: { id: true } })) return "duplicate";
      await tx.user.update({ where: { id }, data });
      return "success";
    }),
    setStatus: (actorId, id, status) => inTransaction(async (tx) => {
      if (!(await lockAndCheckActor(tx, actorId))) return "forbidden";
      const target = await tx.user.findUnique({ where: { id }, select: { role: true, status: true } });
      if (!target) return "notFound";
      if (id === actorId && status === "DISABLED") return "self";
      if (target.role === "ADMIN" && target.status === "ACTIVE" && status === "DISABLED") {
        if (await tx.user.count({ where: { role: "ADMIN", status: "ACTIVE" } }) <= 1) return "lastAdmin";
      }
      await tx.user.update({ where: { id }, data: { status } });
      return "success";
    }),
  };
}

export const staffRepository = createStaffRepository(prisma, (callback) => prisma.$transaction(callback));
