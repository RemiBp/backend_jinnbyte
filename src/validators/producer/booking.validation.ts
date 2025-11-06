import { z } from 'zod';
import { BookingStatusEnums } from '../../enums/bookingStatus.enum';

export const createBookingSchema = z.object({
  eventId: z
    .number({ required_error: "Event ID is required" })
    .positive("Event ID must be a positive number"),
  guestCount: z
    .number({ required_error: "Guest count is required" })
    .min(1, "Guest count must be at least 1"),
  status: z
    .nativeEnum(BookingStatusEnums)
    .default(BookingStatusEnums.SCHEDULED)
    .optional(),
});

export type createBookingInput = z.infer<typeof createBookingSchema>;

export const bookingIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type bookingIdParam = z.infer<typeof bookingIdParamSchema>;