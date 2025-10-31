import { z } from "zod";
import { OwnerType } from "../../enums/OwnerType.enum";
import { SubscriptionPlan } from "../../enums/SubscriptionPlan.enum";

export const SubscriptionSchema = z.object({
  ownerType: z.nativeEnum(OwnerType),
  plan: z.nativeEnum(SubscriptionPlan),
  amount: z.number().nonnegative(),
  providerData: z.object({
    provider: z.string().optional(),
    subscriptionId: z.string().optional(),
    transactionId: z.string().optional(),
  }).optional(),
});

export type SubscriptionInput = z.infer<typeof SubscriptionSchema>;
