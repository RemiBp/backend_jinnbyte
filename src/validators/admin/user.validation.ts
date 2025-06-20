import { z } from 'zod';

export const getUsersSchema = z.object({
  page: z.number({ required_error: 'page is required' }),
  limit: z.number({ required_error: 'limit is required' }),
  keyword: z.string().optional(),
});

export type GetUsersSchema = z.infer<typeof getUsersSchema>;
