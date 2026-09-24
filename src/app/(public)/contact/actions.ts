"use server";

import { createPublicEnquiry } from "@/features/enquiry/create-enquiry";
import type { EnquiryState } from "@/features/enquiry/validation";
import { leadIntakeRepository } from "@/server/db/repositories/lead-intake";
import { allowRequest } from "@/server/security/rate-limit";

export async function submitEnquiry(_previous: EnquiryState, formData: FormData): Promise<EnquiryState> {
  try {
    if (!(await allowRequest("enquiry"))) return { status: "rateLimited" };
    return await createPublicEnquiry({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      company: formData.get("company"),
      message: formData.get("message"),
      serviceId: formData.get("serviceId"),
      website: formData.get("website"),
    }, leadIntakeRepository);
  } catch {
    return { status: "error" };
  }
}
