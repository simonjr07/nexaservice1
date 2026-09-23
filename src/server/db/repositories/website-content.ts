import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { SettingsInput, TestimonialInput } from "@/features/website-content/validation";
import { prisma } from "@/server/db/client";

export type TestimonialRecord = TestimonialInput & { id: string; createdAt: Date; updatedAt: Date };
export type PublicTestimonial = Pick<TestimonialRecord, "id" | "customerName" | "company" | "content">;
export type SettingsRecord = SettingsInput & { updatedAt: Date };

export type WebsiteContentRepository = {
  listTestimonials(): Promise<TestimonialRecord[]>;
  findTestimonial(id: string): Promise<TestimonialRecord | null>;
  listPublishedTestimonials(): Promise<PublicTestimonial[]>;
  createTestimonial(data: TestimonialInput): Promise<{ id: string }>;
  updateTestimonial(id: string, data: TestimonialInput): Promise<boolean>;
  setTestimonialPublished(id: string, published: boolean): Promise<boolean>;
  getSettings(): Promise<SettingsRecord | null>;
  saveSettings(data: SettingsInput): Promise<SettingsRecord>;
};

const testimonialFields = {
  id: true, customerName: true, company: true, content: true, published: true,
  createdAt: true, updatedAt: true,
} as const;
const settingsFields = { businessName: true, email: true, phone: true, address: true, updatedAt: true } as const;

export function createWebsiteContentRepository(db: Pick<PrismaClient, "testimonial" | "siteSettings">): WebsiteContentRepository {
  return {
    listTestimonials: () => db.testimonial.findMany({ select: testimonialFields, orderBy: [{ createdAt: "desc" }, { id: "desc" }] }),
    findTestimonial: (id) => db.testimonial.findUnique({ where: { id }, select: testimonialFields }),
    listPublishedTestimonials: () => db.testimonial.findMany({
      where: { published: true },
      select: { id: true, customerName: true, company: true, content: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }),
    createTestimonial: (data) => db.testimonial.create({ data, select: { id: true } }),
    async updateTestimonial(id, data) {
      return (await db.testimonial.updateMany({ where: { id }, data })).count === 1;
    },
    async setTestimonialPublished(id, published) {
      return (await db.testimonial.updateMany({ where: { id }, data: { published } })).count === 1;
    },
    getSettings: () => db.siteSettings.findUnique({ where: { id: 1 }, select: settingsFields }),
    saveSettings: (data) => db.siteSettings.upsert({
      where: { id: 1 }, create: { id: 1, ...data }, update: data, select: settingsFields,
    }),
  };
}

export const websiteContentRepository = createWebsiteContentRepository(prisma);
