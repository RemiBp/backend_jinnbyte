import { z } from 'zod';

export const createBookingSchema = z.object({
  userId: z.number({ required_error: 'userId is required' }),
  restaurantId: z.number({ required_error: 'restaurantId is required' }),
  slotId: z.number({ required_error: 'slotId is required' }),
  date: z.string({ required_error: 'date is required' }),
  specialRequest: z.string().optional(),
  timeZone: z.string({ required_error: 'timeZone is required' }),
  guestCount: z.number({ required_error: 'guestCount is required' }),
});

export type CreateBookingSchema = z.infer<typeof createBookingSchema>;

export const updateBookingSchema = z.object({
  userId: z.number({ required_error: 'userId is required' }),
  bookingId: z.number({ required_error: 'bookingId is required' }),
  slotId: z.number({ required_error: 'slotId is required' }),
  date: z.string({ required_error: 'date is required' }),
  specialRequest: z.string().optional(),
  timeZone: z.string({ required_error: 'timeZone is required' }),
  guestCount: z.number({ required_error: 'guestCount is required' }),
});

export type UpdateBookingSchema = z.infer<typeof updateBookingSchema>;

export const getCuisineTypesSchema = z.object({
  page: z.number({ required_error: 'page is required' }),
  limit: z.number({ required_error: 'limit is required' }),
  keyword: z.string().optional(),
});

export type GetCuisineTypesSchema = z.infer<typeof getCuisineTypesSchema>;

export const findRestaurantsNearbySchema = z.object({
  userId: z.number({ required_error: 'userId is required' }),
  latitude: z.number({ required_error: 'latitude is required' }),
  longitude: z.number({ required_error: 'longitude is required' }),
  keyword: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  radius: z.number().optional(),
});

export type FindRestaurantsNearbySchema = z.infer<typeof findRestaurantsNearbySchema>;

export const findRestaurantsByCuisineSchema = z.object({
  userId: z.number({ required_error: 'userId is required' }),
  latitude: z.number({ required_error: 'latitude is required' }),
  longitude: z.number({ required_error: 'longitude is required' }),
  cuisineTypeId: z.number({ required_error: 'cuisineTypeId is required' }),
  page: z.number().optional(),
  limit: z.number().optional(),
  radius: z.number().optional(),
});

export type FindRestaurantsByCuisineSchema = z.infer<typeof findRestaurantsByCuisineSchema>;

export const addReviewSchema = z.object({
  userId: z.number({ required_error: 'userId is required' }),
  bookingId: z.number({ required_error: 'bookingId is required' }),
  rating: z.number({ required_error: 'rating is required' }),
  review: z.string({ required_error: 'review is required' }),
});

export type AddReviewSchema = z.infer<typeof addReviewSchema>;

export * as BookingSchema from './booking.validation';
