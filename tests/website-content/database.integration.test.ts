import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

const rollback = new Error("ROLLBACK_WEBSITE_CONTENT_TEST");

describe.skipIf(process.env.RUN_DATABASE_TESTS !== "1")("PostgreSQL website content", () => {
  it("filters published testimonials and maintains one settings row without lasting changes", async () => {
    const { config } = await import("dotenv");
    config({ quiet: true });
    const { prisma } = await import("@/server/db/client");
    const { createWebsiteContentRepository } = await import("@/server/db/repositories/website-content");
    const marker = randomUUID();
    const before = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    try {
      await prisma.$transaction(async (tx) => {
        const repository = createWebsiteContentRepository(tx);
        const draft = await repository.createTestimonial({ customerName: "Fictional Client", company: null, content: "A sample testimonial inside a rolled-back transaction.", published: false });
        expect(await repository.listPublishedTestimonials()).not.toContainEqual(expect.objectContaining({ id: draft.id }));
        await repository.setTestimonialPublished(draft.id, true);
        expect(await repository.listPublishedTestimonials()).toContainEqual(expect.objectContaining({ id: draft.id }));
        await repository.updateTestimonial(draft.id, { customerName: "Updated Fictional Client", company: "Sample Co", content: "An updated fictional testimonial in a test transaction.", published: true });
        expect(await repository.findTestimonial(draft.id)).toMatchObject({ customerName: "Updated Fictional Client", company: "Sample Co" });
        await repository.setTestimonialPublished(draft.id, false);
        expect(await repository.listPublishedTestimonials()).not.toContainEqual(expect.objectContaining({ id: draft.id }));

        const settings = { businessName: `Sample Business ${marker}`, email: `hello-${marker}@example.test`, phone: "+1 555 010 3333", address: "10 Fictional Street, Sample City" };
        await repository.saveSettings(settings);
        expect(await repository.getSettings()).toMatchObject(settings);
        await repository.saveSettings({ ...settings, businessName: `Updated Sample ${marker}` });
        expect(await tx.siteSettings.count()).toBe(1);
        expect(await repository.getSettings()).toMatchObject({ businessName: `Updated Sample ${marker}` });
        throw rollback;
      });
    } catch (error) {
      if (error !== rollback) throw error;
    } finally {
      expect(await prisma.siteSettings.findUnique({ where: { id: 1 } })).toEqual(before);
      await prisma.$disconnect();
    }
  }, 20_000);
});
