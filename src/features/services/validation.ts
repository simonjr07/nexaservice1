import { z } from "zod";

const requiredText = (label: string, min: number, max: number) => z.string().trim()
  .min(min, `${label} must be at least ${min} characters.`)
  .max(max, `${label} must be ${max} characters or fewer.`);

export const serviceIdSchema = z.uuid();

export const serviceInputSchema = z.object({
  name: requiredText("Name", 2, 120),
  slug: z.string().trim().toLowerCase().transform((value) => value.replace(/\s+/g, "-")).pipe(z.string()
    .min(3, "Slug must be at least 3 characters.")
    .max(100, "Slug must be 100 characters or fewer.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens between words.")),
  shortDescription: requiredText("Short description", 10, 300),
  description: requiredText("Description", 20, 5000),
  published: z.boolean(),
});

export type ServiceInput = z.infer<typeof serviceInputSchema>;
export type ServiceField = keyof ServiceInput;
export type ServiceActionState = {
  status: "idle" | "invalid" | "duplicate" | "notFound" | "success" | "error";
  fieldErrors?: Partial<Record<ServiceField, string>>;
  id?: string;
  message?: string;
};
export const initialServiceActionState: ServiceActionState = { status: "idle" };
