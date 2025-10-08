import { z } from "zod";

export const CreateInterestSchema = z.object({
  type: z.enum(["Producer", "Event"]),
  producerId: z.number().optional(),
  eventId: z.number().optional(),
  slotId: z.number().optional(),
  suggestedTime: z.string().optional(),
  message: z.string().optional(),
  invitedUserIds: z.array(z.number()).optional(),
});

export type CreateInterestInput = z.infer<typeof CreateInterestSchema>;

export const AcceptInterestInviteSchema = z.object({
  interestId: z.number({
    required_error: "Interest ID is required.",
    invalid_type_error: "Interest ID must be a number.",
  }),
})

export type AcceptInterestInviteInput = z.infer<typeof AcceptInterestInviteSchema>;

export const DeclineInterestInviteSchema = z.object({
  interestId: z.number({
    required_error: "Interest ID is required.",
  }),
  reason: z
    .string()
    .min(1, "Reason must not be empty.")
    .max(300, "Reason too long.")
    .optional(),
});

export type DeclineInterestInviteInput = z.infer<typeof DeclineInterestInviteSchema>;

export const SuggestNewTimeSchema = z
  .object({
    interestId: z.number({
      required_error: "Interest ID is required.",
    }),
    slotId: z.number().optional(),
    suggestedTime: z.string().optional(),
    message: z.string().optional(),
  })
  .refine((data) => data.slotId || data.suggestedTime, {
    message: "Either slotId or suggestedTime must be provided.",
    path: ["slotId"],
  });

export type SuggestNewTimeInput = z.infer<typeof SuggestNewTimeSchema>;