import { z } from 'zod';

export const createBookingSchema = z.object({
  eventId: z.number({ required_error: 'Event ID is required' }),
  guestCount: z.number().min(1),
  internalNotes: z.string().max(500, 'Too long').optional().default(''),
});

export type createBookingInput = z.infer<typeof createBookingSchema>;

export const bookingIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type bookingIdParam = z.infer<typeof bookingIdParamSchema>;