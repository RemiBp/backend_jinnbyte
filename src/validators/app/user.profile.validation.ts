import { z } from 'zod';

export const presignedURLSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
  folderName: z.enum([
    'userProfileImages',
    'companyProfileImages',
    'technicianProfileImages',
    'licenseCardFrontUrl',
    'licenseCardBackUrl',
    'serviceImages',
    'serviceItemImagesFromTechnician',
  ]),
});

export type PreSignedURL = z.infer<typeof presignedURLSchema>;

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(255).optional(),
  lastName: z.string().min(2).max(255).optional(),
  profilePicture: z.string({ required_error: 'profilePicture is required' }).trim(),
  phoneNumber: z.string().min(2).max(255).optional(),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

export const accountDeleteSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6).max(32, 'Password must be between 6 and 32 characters'),
});

export type AccountDeleteSchema = z.infer<typeof accountDeleteSchema>;

export * as ProfileSchema from './user.profile.validation';
