import { z } from 'zod';
import { businessRoles } from '../../utils/businessRoles';
import { ServiceType } from '../../enums/serviceType.enum';

export const createProducerSchema = z.object({
  name: z.string().min(2, 'Producer name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[0-9\s\-]{7,20}$/, 'Invalid phone number')
    .optional(),
  website: z.string().url().optional(),
  placeId: z.string().min(1, 'Place ID is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  type: z.enum(businessRoles, { required_error: 'Producer type is required' }),
  serviceType: z.nativeEnum(ServiceType).optional(),
  totalCapacity: z.number().optional(),
  document1: z.string({ required_error: 'Document1 is required' }),
  document2: z.string({ required_error: 'Document2 is required' }),
});

export type CreateProducer = z.infer<typeof createProducerSchema>;

export const signUpSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email({ message: 'Please enter a valid email address' })
    .transform(val => val.toLowerCase()),

  password: z
    .string({ required_error: 'Password is required' })
    .trim()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Must include at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Must include at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Must include at least one number' })
    .regex(/[^A-Za-z0-9]/, { message: 'Must include at least one special character' }),

  businessName: z
    .string({ required_error: 'Business name is required' })
    .trim()
    .min(2, { message: 'Business name must be at least 2 characters long' }),

  role: z.enum(businessRoles, {
    required_error: 'Role is required',
    invalid_type_error: 'Invalid role',
  }),
});

export type SignUp = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email({ message: 'Please enter a valid email address' }),

  password: z
    .string({ required_error: 'Password is required' })
    .trim()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(32, { message: 'Password must be at most 32 characters long' }),

  deviceId: z
    .string({ required_error: 'Device ID is required' })
    .trim(),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().min(6).max(6, 'otp must be of length 6'),
});

export type VerifyOtpSchema = z.infer<typeof verifyOtpSchema>;

export const getPresignedDocumentSchema = z.object({
  filename: z
    .string({ required_error: 'Filename is required' })
    .min(1, 'Filename cannot be empty')
    .regex(/\.pdf$/i, 'Only PDF files are allowed'),
  contentType: z
    .string({ required_error: 'Content-Type is required' })
    .refine(val => val === 'application/pdf', {
      message: 'Only application/pdf contentType is allowed',
    }),
});

export type GetPresignedDocumentInput = z.infer<typeof getPresignedDocumentSchema>;

export const submitDocumentsSchema = z.object({
  document1: z.string().min(1, 'Document 1 is required'),
  document1Expiry: z.coerce.date({ required_error: 'Document 1 expiry date is required' }),
  document2: z.string().min(1, 'Document 2 is required'),
  document2Expiry: z.coerce.date({ required_error: 'Document 2 expiry date is required' }),
});

export type SubmitDocumentsInput = z.infer<typeof submitDocumentsSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string({ required_error: 'OTP is required' }).trim(),
  password: z.string({ required_error: 'Password is required' }).trim(),
});

export type ResetPassword = z.infer<typeof resetPasswordSchema>;

export const verifyOTPSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email({ message: 'Invalid email' })
    .transform(val => val.toLowerCase()),
  otp: z.string({ required_error: 'OTP is required' }).trim(),
});

export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
