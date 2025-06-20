import { profile } from 'console';
import { z } from 'zod';

export const uploadDocumentsSchema = z.object({
  userId: z.number({ required_error: 'userId is required' }),
  certificateOfHospitality: z.string({
    required_error: 'certificateOfHospitality is required',
  }),
  certificateOfTourism: z.string({
    required_error: 'certificateOfTourism is required',
  }),
});

export type UploadDocuments = z.infer<typeof uploadDocumentsSchema>;

export const presignedURLSchema = z
  .object({
    fileName: z.string({ required_error: 'fileName is required' }),
    contentType: z.string({ required_error: 'contentType is required' }),
    folderName: z.enum(
      ['adminProfileImage', 'cuisneTypeImage', 'certificateOfHospitality', 'certificateOfTourism', 'menu'],
      {
        required_error: 'folderName is required',
      }
    ),
  })
  .refine(
    data => {
      if (
        data.folderName === 'certificateOfHospitality' ||
        data.folderName === 'certificateOfTourism' ||
        data.folderName === 'menu'
      ) {
        return data.contentType === 'application/pdf';
      }
      return true;
    },
    {
      message: 'contentType must be application/pdf for certificates and menu folders',
      path: ['contentType'],
    }
  );

export type PreSignedURL = z.infer<typeof presignedURLSchema>;

export const updateProfileSchema = z.object({
  firstName: z.string({ required_error: 'firstName is required' }).trim(),
  lastName: z.string({ required_error: 'lastName is required' }).trim(),
  phoneNumber: z.string({ required_error: 'phoneNumber is required' }).trim(),
  profilePicture: z.string({ required_error: 'profilePicture is required' }).trim(),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

export const updateHelpAndSupportSchema = z.object({
  emailForCustomers: z.string().optional(),
  phoneForCustomers: z.string().optional(),
  emailForRestaurants: z.string().optional(),
  phoneForRestaurants: z.string().optional(),
});

export type UpdateHelpAndSupportSchema = z.infer<typeof updateHelpAndSupportSchema>;

export * as ProfileSchema from './profile.validation';
