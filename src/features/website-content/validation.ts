import { z } from "zod";

const text = (label: string, min: number, max: number) => z.string().trim()
  .min(min, `${label} must be at least ${min} characters.`)
  .max(max, `${label} must be ${max} characters or fewer.`);

export const testimonialIdSchema = z.uuid();
export const testimonialInputSchema = z.object({
  customerName: text("Customer name", 2, 120),
  company: z.preprocess((value) => value == null ? "" : value,
    z.string().trim().max(120, "Company must be 120 characters or fewer.").transform((value) => value || null)),
  content: text("Testimonial", 20, 2000),
  published: z.boolean(),
});
export type TestimonialInput = z.infer<typeof testimonialInputSchema>;
export type TestimonialField = keyof TestimonialInput;

export const settingsInputSchema = z.object({
  businessName: text("Business name", 2, 120),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address.").max(254)),
  phone: text("Phone", 7, 40).regex(/^\+?\d[\d\s().-]*$/, "Enter a valid phone number."),
  address: text("Address", 5, 300),
});
export type SettingsInput = z.infer<typeof settingsInputSchema>;
export type SettingsField = keyof SettingsInput;

export type ContentActionState<T extends string> = {
  status: "idle" | "invalid" | "notFound" | "success" | "error";
  fieldErrors?: Partial<Record<T, string>>;
  id?: string;
};
export const initialTestimonialState: ContentActionState<TestimonialField> = { status: "idle" };
export const initialSettingsState: ContentActionState<SettingsField> = { status: "idle" };

export function fieldErrors<T extends string>(issues: z.core.$ZodIssue[]): Partial<Record<T, string>> {
  const errors: Partial<Record<T, string>> = {};
  for (const issue of issues) {
    const field = issue.path[0] as T;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}
