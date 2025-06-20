import { z } from 'zod';

export const getRestaurantsSchema = z.object({
  page: z.number({ required_error: 'page is required' }),
  limit: z.number({ required_error: 'limit is required' }),
  keyword: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

export type GetRestaurantsSchema = z.infer<typeof getRestaurantsSchema>;

export const updateAccountStatusSchema = z
  .object({
    userId: z.number({ required_error: 'userId is required' }),
    accountStatus: z.enum(['underReview', 'approved', 'rejected'], {
      required_error: 'accountStatus is required',
    }),
    rejectReason: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.accountStatus === 'rejected' && (!data.rejectReason || data.rejectReason.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'rejectReason is required when accountStatus is rejected',
        path: ['rejectReason'],
      });
    }
  });

export type UpdateAccountStatus = z.infer<typeof updateAccountStatusSchema>;
