import { z } from 'zod';
import { ServiceType } from '../../enums/serviceType.enum';
import { EventStatus } from '../../enums/eventStatus.enum';

export const createEventSchema = z.object({
    title: z
        .string({ required_error: 'Event title is required' })
        .min(3, 'Event title must be at least 3 characters'),

    description: z
        .string()
        .max(1000, 'Description is too long')
        .optional(),

    experienceType: z.nativeEnum(ServiceType, {
        required_error: 'Experience type is required',
        invalid_type_error: 'Invalid experience type',
    }),

    location: z
        .string({ required_error: 'Location is required' })
        .min(3, 'Location must be at least 3 characters'),

    pricePerGuest: z
        .number({ required_error: 'Price is required' })
        .min(0, 'Price must be 0 or more'),

    maxCapacity: z
        .number({ required_error: 'Maximum capacity is required' })
        .int('Capacity must be an integer')
        .positive('Capacity must be greater than 0'),

    date: z
        .string({ required_error: 'Date is required' })
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),

    startTime: z
        .string({ required_error: 'Start time is required' })
        .regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:mm format'),

    endTime: z
        .string({ required_error: 'End time is required' })
        .regex(/^\d{2}:\d{2}$/, 'End time must be in HH:mm format'),

    eventImages: z
        .array(
            z.string().min(1, 'Image path cannot be empty')
        )
        .max(9, 'Max 9 images allowed')
        .optional(),

    status: z.nativeEnum(EventStatus, {
        required_error: 'Event status is required',
        invalid_type_error: 'Invalid event status',
    }),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = z.object({
    title: z.string().min(3, 'Event title is required').optional(),
    description: z.string().optional(),
    experienceType: z.string().min(1, 'Experience type is required').optional(),
    location: z.string().min(3, 'Location is required').optional(),
    pricePerGuest: z.number().min(0).optional(),
    maxCapacity: z.number().int().positive().optional(),
    date: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    eventImages: z.array(z.string()).max(9, 'Max 9 images allowed').optional(),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const getEventByIdSchema = z.object({
    eventId: z.number().int().positive(),
});
export type GetEventByIdInput = z.infer<typeof getEventByIdSchema>;

export const deleteEventSchema = z.object({
    eventId: z.number().int().positive(),
});

export type DeleteEventInput = z.infer<typeof deleteEventSchema>;