import "server-only";

import { enquirySchema, type EnquiryField, type EnquiryState } from "@/features/enquiry/validation";
import type { LeadIntakeRepository } from "@/server/db/repositories/lead-intake";

type RawEnquiry = Record<EnquiryField, unknown> & { website: unknown };

export async function createPublicEnquiry(raw: RawEnquiry, repository: LeadIntakeRepository): Promise<EnquiryState> {
  // Give automated submissions the same public acknowledgement without writing a Lead.
  if (typeof raw.website === "string" && raw.website.trim() !== "") return { status: "success" };
  if (raw.website !== null && (typeof raw.website !== "string" || raw.website.trim() !== "")) return { status: "error" };

  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<EnquiryField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as EnquiryField | undefined;
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { status: "invalid", fieldErrors };
  }

  const input = parsed.data;
  if (input.serviceId && !(await repository.isPublishedService(input.serviceId))) {
    return { status: "invalid", fieldErrors: { serviceId: "Choose an available service." } };
  }

  await repository.createLead({
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    company: input.company ?? null,
    message: input.message,
    serviceId: input.serviceId ?? null,
  });
  return { status: "success" };
}
