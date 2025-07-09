import { profile } from 'console';
import { z } from 'zod';
import { deleteRestaurantImage } from '../../services/producer/profile.service';
import { ServiceType } from '../../enums/serviceType.enum';
import { UploadFolder } from '../../enums/uploadFolder.enum';

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

export const presignedURLSchema = z.object({
  fileName: z.string({ required_error: 'fileName is required' }),
  contentType: z.string({ required_error: 'contentType is required' }),
  folderName: z.nativeEnum(UploadFolder, {
    required_error: 'folderName is required',
    invalid_type_error: 'Invalid folder name',
  }),
});

export type PreSignedURL = z.infer<typeof presignedURLSchema>;

export const updateProfileSchema = z.object({
  businessName: z.string({ required_error: 'Business name is required' }).trim(),
  address: z.string({ required_error: 'Address is required' }).trim(),
  phoneNumber: z.string({ required_error: 'Phone number is required' }).trim(),
  website: z.string().url().optional(),
  instagram: z.string().url().optional(),
  twitter: z.string().url().optional(),
  facebook: z.string().url().optional(),
  description: z.string({ required_error: 'Description is required' }).trim(),
  profileImageUrl: z.string().optional(),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

const dayHourSchema = z
  .object({
    day: z.string({ required_error: 'day is required' }),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    isClosed: z.boolean().optional().default(false),
  })
  .refine(
    data => {
      if (data.isClosed === true) return true;
      return !!data.startTime && !!data.endTime;
    },
    {
      message: 'Provide either startTime and endTime, or set isClosed to true',
    }
  );

export const setOperationHoursSchema = z.object({
  hours: z
    .array(dayHourSchema)
    .length(7, 'Exactly 7 days of hours must be provided'),
});

export type SetOperationHoursSchema = z.infer<typeof setOperationHoursSchema>;

export * as ProfileSchema from './profile.validation';

export const uploadRestaurantImagesSchema = z.object({
  restaurantId: z.number({ required_error: 'restaurantId is required' }),
  images: z
    .array(
      z.object({
        url: z.string({ required_error: 'Image URL is required' }).url('Invalid image URL'),
        isMain: z.boolean().optional(),
      })
    )
    .min(1, 'At least one image is required'),
});

export type UploadRestaurantImagesSchema = z.infer<typeof uploadRestaurantImagesSchema>;

export const setCapacitySchema = z.object({
  totalCapacity: z
    .number({ required_error: 'Total capacity is required' })
    .int('Must be an integer')
    .positive('Must be greater than 0'),
});

export type SetCapacitySchema = z.infer<typeof setCapacitySchema>;

export const setServiceTypeSchema = z.object({
  serviceType: z.enum(Object.values(ServiceType) as [string, ...string[]]),
});

export type SetServiceTypeInput = z.infer<typeof setServiceTypeSchema>;

export const aiAnalysisSchema = z.object({
  producerId: z.number(),
  careQuality: z.number().optional(),
  cleanliness: z.number().optional(),
  welcome: z.number().optional(),
  valueForMoney: z.number().optional(),
  atmosphere: z.number().optional(),
  staffExpertise: z.number().optional(),
  expectationRespect: z.number().optional(),
  advice: z.number().optional(),
  productsUsed: z.number().optional(),
  pricing: z.number().optional(),
  punctuality: z.number().optional(),
  precision: z.number().optional(),
  hygiene: z.number().optional(),
  creativity: z.number().optional(),
  durability: z.number().optional(),
  painExperience: z.number().optional(),
  averageScore: z.number().optional(),
});

export type AiAnalysisSchema = z.infer<typeof aiAnalysisSchema>;

export const setGalleryImagesSchema = z.object({
  images: z
    .array(
      z.object({
        url: z
          .string()
          .min(1, 'Image URL (key) is required')
          .refine(val => !val.startsWith('http'), {
            message: 'Only S3 keys (not full URLs) are allowed',
          }),
      })
    )
    .min(1, 'At least one image is required'),
});

export type SetGalleryImages = z.infer<typeof setGalleryImagesSchema>;

export const setMainImageSchema = z.object({
  restaurantId: z.number({ required_error: 'restaurantId is required' }),
  imageId: z.number({ required_error: 'imageId is required' }),
});

export type SetMainImageSchema = z.infer<typeof setMainImageSchema>;

export const getRestaurantImagesSchema = z.object({
  restaurantId: z.number({ required_error: 'restaurantId is required' }),
  page: z.number({ required_error: 'page is required' }),
  limit: z.number({ required_error: 'limit is required' }),
});

export type GetRestaurantImagesSchema = z.infer<typeof getRestaurantImagesSchema>;

export const deleteRestaurantImageSchema = z.object({
  restaurantId: z.number({ required_error: 'restaurantId is required' }),
  imageId: z.number({ required_error: 'imageId is required' }),
});

export type DeleteRestaurantImageSchema = z.infer<typeof deleteRestaurantImageSchema>;

export const reviewsAndRatingsSchema = z.object({
  userId: z.number({ required_error: 'restaurantId is required' }),
  page: z.number({ required_error: 'page is required' }),
  limit: z.number({ required_error: 'limit is required' }),
  filter: z.enum(['oldest', 'highest']).optional(),
});

export type ReviewsAndRatingsSchema = z.infer<typeof reviewsAndRatingsSchema>;
