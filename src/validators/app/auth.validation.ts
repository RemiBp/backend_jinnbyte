import { z } from 'zod';

export const AuthInputSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email({ message: 'Invalid email' })
    .transform(val => val.toLowerCase()),
  password: z.string({ required_error: 'Password is required' }).trim(),
  deviceId: z.string({ required_error: 'deviceId is required' }).trim(),
});

export const VerifyOTPSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email({ message: 'Invalid email' })
    .transform(val => val.toLowerCase()),
  otp: z.string({ required_error: 'OTP is required' }).trim(),
});

export const refreshAccessTokenSchema = z.object({
  refreshToken: z.string({ required_error: 'Refresh token is required' }).trim(),
});

export const ZapierAuthenicateRequestSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email({ message: 'Invalid email' })
    .transform(val => val.toLowerCase()),
  apiKey: z.string({ required_error: 'API Key is required' }).trim(),
});

export const ZapierWebhookSchema = ZapierAuthenicateRequestSchema.extend({
  event: z.string({ required_error: 'Event type is required' }).trim(),
  hookUrl: z.string().trim().optional(),
});

export type AuthInput = z.infer<typeof AuthInputSchema>;
export type VerifyOTPInput = z.infer<typeof VerifyOTPSchema>;
export type RefreshAccessTokenInput = z.infer<typeof refreshAccessTokenSchema>;
export type ZapierAuthenicateRequest = z.infer<typeof ZapierAuthenicateRequestSchema>;
export type ZapierWebhookInput = z.infer<typeof ZapierWebhookSchema>;
