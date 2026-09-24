import { randomUUID } from "node:crypto";
import { compare } from "bcryptjs";
import { describe, expect, it } from "vitest";

const rollback = new Error("ROLLBACK_STAFF_MANAGEMENT_TEST");

describe.skipIf(process.env.RUN_DATABASE_TESTS !== "1")("PostgreSQL staff management", () => {
  it("creates, disables, reactivates, and preserves historical relationships inside a rollback", async () => {
    const { config } = await import("dotenv");
    config({ quiet: true });
    const { prisma } = await import("@/server/db/client");
    const { createStaffRepository } = await import("@/server/db/repositories/staff");
    const { createLeadManagementRepository } = await import("@/server/db/repositories/lead-management");
    const { createStaff, editStaff, changeStaffStatus } = await import("@/features/staff/manage-staff");
    const { assignLead, listStaffChoices } = await import("@/features/leads/manage-leads");
    const { authenticateCredentials } = await import("@/server/auth/credentials");
    const marker = randomUUID();
    const email = `staff-${marker}@example.test`;
    const password = "transaction-only password";
    try {
      await prisma.$transaction(async (tx) => {
        const actor = await tx.user.create({ data: { name: "Transaction Admin", email: `admin-${marker}@example.test`, passwordHash: "transaction-only", role: "ADMIN" } });
        expect(actor.status).toBe("ACTIVE");
        const admin = { id: actor.id, name: actor.name, email: actor.email, role: actor.role };
        const repository = createStaffRepository(tx, (callback) => callback(tx));
        const leadRepository = createLeadManagementRepository(tx);
        const created = await createStaff(admin, { name: "Transaction Staff", email: email.toUpperCase(), role: "STAFF", password }, repository);
        expect(created.status).toBe("success");
        const competing = await prisma.$queryRaw<Array<{ locked: boolean }>>`SELECT pg_try_advisory_xact_lock(52345, 11) AS locked`;
        expect(competing[0].locked).toBe(false);
        const staffId = created.id!;
        const stored = await tx.user.findUniqueOrThrow({ where: { id: staffId } });
        expect(stored.email).toBe(email);
        expect(stored.status).toBe("ACTIVE");
        expect(stored.passwordHash).not.toBe(password);
        expect(await compare(password, stored.passwordHash)).toBe(true);
        expect(JSON.stringify(await repository.list())).not.toContain(stored.passwordHash);
        expect(await createStaff(admin, { name: "Duplicate", email, role: "STAFF", password }, repository)).toMatchObject({ status: "duplicate" });
        expect(await editStaff(admin, staffId, { name: "Duplicate", email: actor.email, role: "STAFF" }, repository)).toMatchObject({ status: "duplicate" });

        const lead = await tx.lead.create({ data: { name: "Fictional Visitor", email: `lead-${marker}@example.test`, message: "A transaction-only enquiry.", assignedUserId: staffId } });
        const note = await tx.leadNote.create({ data: { leadId: lead.id, authorId: staffId, content: "Historical test note." } });
        expect(await changeStaffStatus(admin, staffId, "DISABLED", repository)).toMatchObject({ status: "success" });
        expect(await tx.user.findUnique({ where: { id: staffId, status: "ACTIVE" }, select: { id: true } })).toBeNull();
        const lookup = (value: string) => tx.user.findUnique({ where: { email: value }, select: { id: true, name: true, email: true, role: true, status: true, passwordHash: true } });
        await expect(authenticateCredentials({ email, password }, lookup)).resolves.toBeNull();
        expect((await listStaffChoices(admin, leadRepository)).map((item) => item.id)).not.toContain(staffId);
        expect(await leadRepository.assignableUserExists(staffId)).toBe(false);
        expect(await assignLead(admin, lead.id, staffId, leadRepository)).toMatchObject({ status: "invalid" });
        expect((await tx.lead.findUniqueOrThrow({ where: { id: lead.id } })).assignedUserId).toBe(staffId);
        expect((await tx.leadNote.findUniqueOrThrow({ where: { id: note.id } })).authorId).toBe(staffId);

        expect(await changeStaffStatus(admin, staffId, "ACTIVE", repository)).toMatchObject({ status: "success" });
        expect(await tx.user.findUnique({ where: { id: staffId, status: "ACTIVE" }, select: { id: true } })).toEqual({ id: staffId });
        await expect(authenticateCredentials({ email, password }, lookup)).resolves.toMatchObject({ id: staffId, role: "STAFF" });
        expect((await listStaffChoices(admin, leadRepository)).map((item) => item.id)).toContain(staffId);
        expect(await editStaff(admin, staffId, { name: "Updated Staff", email, role: "STAFF" }, repository)).toMatchObject({ status: "success" });
        expect((await tx.user.findUniqueOrThrow({ where: { id: staffId } })).passwordHash).toBe(stored.passwordHash);

        expect(await changeStaffStatus(admin, actor.id, "DISABLED", repository)).toMatchObject({ status: "self" });
        expect(await editStaff(admin, actor.id, { name: actor.name, email: actor.email, role: "STAFF" }, repository)).toMatchObject({ status: "self" });
        expect(await tx.user.count({ where: { role: "ADMIN", status: "ACTIVE" } })).toBeGreaterThanOrEqual(1);
        throw rollback;
      }, { timeout: 30_000 });
    } catch (error) {
      if (error !== rollback) throw error;
    } finally {
      expect(await prisma.user.findUnique({ where: { email } })).toBeNull();
      await prisma.$disconnect();
    }
  }, 40_000);
});
