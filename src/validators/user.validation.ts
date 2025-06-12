import { z } from "zod";

export const OnboardingInputSchema = z
  .object({
    onboarding: z.boolean().optional(),
    fullName: z.string().trim().optional(),
    language: z.string().trim().optional(),
    plan: z.string().trim().optional(),
    trial: z.number().optional(),
    metadata: z.record(z.any()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type OnboardingInput = z.infer<typeof OnboardingInputSchema>;
