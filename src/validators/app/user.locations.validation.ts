import { z } from 'zod';

export const updateLocationSchema = z.object({
  location: z.string({ required_error: 'Location is required' }),
  latitude: z.number({ required_error: 'latitude is required' }),
  longitude: z.number({ required_error: 'longitude is required' }),
  locationTag: z.string({ required_error: 'locationTag is required' }).min(2).max(255),
});

export type UpdateLocationSchema = z.infer<typeof updateLocationSchema>;
export type AddLocationSchema = z.infer<typeof updateLocationSchema>;

export * as UserLocationsSchema from './user.locations.validation';
