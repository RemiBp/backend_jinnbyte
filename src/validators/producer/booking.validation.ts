import { z } from 'zod';

export const createBookingSchema = z.object({
  guestCount: z.number().min(1),
});

export type createBookingInput = z.infer<typeof createBookingSchema>;

export const bookingIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type bookingIdParam = z.infer<typeof bookingIdParamSchema>;