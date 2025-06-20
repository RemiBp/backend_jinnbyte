import { z } from 'zod';

export const getCuisineTypesSchema = z.object({
  page: z.number({ required_error: 'page is required' }),
  limit: z.number({ required_error: 'limit is required' }),
  keyword: z.string().optional(),
});

export type getCuisineTypesSchema = z.infer<typeof getCuisineTypesSchema>;

export const createCuisineTypeSchema = z.object({
  name: z.string({ required_error: 'name is required' }),
  imageUrl: z.string({ required_error: 'imageUrl is required' }),
});

export type CreateCuisineTypeSchema = z.infer<typeof createCuisineTypeSchema>;

export const updateCuisineTypeSchema = z.object({
  cuisineTypeId: z.number({ required_error: 'cuisineTypeId is required' }),
  name: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateCuisineTypeSchema = z.infer<typeof updateCuisineTypeSchema>;
