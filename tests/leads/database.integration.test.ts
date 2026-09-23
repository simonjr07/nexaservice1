import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

const rollback = new Error("ROLLBACK_LEAD_MANAGEMENT_TEST");

describe.skipIf(process.env.RUN_DATABASE_TESTS !== "1")("PostgreSQL lead management", () => {
  it("reads an enquiry, filters it, updates status, records a private note, and assigns staff before rollback", async () => {
    const { config } = await import("dotenv");
    config({ quiet: true });
    const { prisma } = await import("@/server/db/client");
    const { createLeadIntakeRepository } = await import("@/server/db/repositories/lead-intake");
    const { createPublicEnquiry } = await import("@/features/enquiry/create-enquiry");
    const { createLeadManagementRepository } = await import("@/server/db/repositories/lead-management");
    const { listLeads, getLeadDetail, changeLeadStatus, writeLeadNote, assignLead } = await import("@/features/leads/manage-leads");
    const marker = randomUUID();

    try {
      await prisma.$transaction(async (tx) => {
        const admin = await tx.user.create({ data: { name: "Test Admin", email: `admin-${marker}@example.test`, passwordHash: "transaction-only", role: "ADMIN" } });
        const staff = await tx.user.create({ data: { name: "Test Staff", email: `staff-${marker}@example.test`, passwordHash: "transaction-only", role: "STAFF" } });
        const service = await tx.service.create({ data: { name: `Service ${marker}`, slug: `service-${marker}`, shortDescription: "Test", description: "Transaction only", published: true } });
        const email = `lead-${marker}@example.test`;
        const intake = createLeadIntakeRepository(tx);
        const repository = createLeadManagementRepository(tx);
        await expect(createPublicEnquiry({ name: `Visitor ${marker}`, email, phone: "", company: ` Studio ${marker} `, message: "Please discuss our service needs.", serviceId: service.id, website: "" }, intake)).resolves.toEqual({ status: "success" });

        const listing = await listLeads(staff, { q: marker, status: "NEW", serviceId: service.id }, repository);
        expect(listing?.items).toHaveLength(1);
        const leadId = listing!.items[0].id;
        const detail = await getLeadDetail(staff, leadId, repository);
        expect(detail).toMatchObject({ email, status: "NEW", company: `Studio ${marker}`, service: { name: service.name }, notes: [] });
        expect(detail).not.toHaveProperty("passwordHash");
        expect((await listLeads(staff, { q: `studio ${marker.toUpperCase()}` }, repository))?.items.map((item) => item.id)).toContain(leadId);
        expect((await listLeads(staff, { q: email.toUpperCase() }, repository))?.items.map((item) => item.id)).toContain(leadId);
        expect((await listLeads(admin, { q: "no-such-lead", status: "NEW" }, repository))?.items).toHaveLength(0);

        await expect(changeLeadStatus(staff, leadId, "CONTACTED", repository)).resolves.toEqual({ status: "success" });
        await expect(writeLeadNote(staff, leadId, "  Called and requested more details.  ", repository)).resolves.toEqual({ status: "success" });
        await expect(assignLead(staff, leadId, admin.id, repository)).rejects.toMatchObject({ name: "ForbiddenError" });
        await expect(assignLead(admin, leadId, staff.id, repository)).resolves.toEqual({ status: "success" });

        const updated = await getLeadDetail(admin, leadId, repository);
        expect(updated).toMatchObject({ status: "CONTACTED", assignedUser: { id: staff.id } });
        expect(updated?.notes).toHaveLength(1);
        expect(updated?.notes[0]).toMatchObject({ content: "Called and requested more details.", author: { name: staff.name, email: staff.email } });
        expect(JSON.stringify(updated)).not.toContain("transaction-only");
        expect((await listLeads(staff, { q: marker, status: "CONTACTED" }, repository))?.items.map((item) => item.id)).toContain(leadId);
        await expect(assignLead(admin, leadId, "", repository)).resolves.toEqual({ status: "success" });
        expect((await getLeadDetail(admin, leadId, repository))?.assignedUser).toBeNull();
        throw rollback;
      });
    } catch (error) {
      if (error !== rollback) throw error;
    } finally {
      await prisma.$disconnect();
    }
  }, 20_000);
});
