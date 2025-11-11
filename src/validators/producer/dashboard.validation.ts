// validators/producer/dashboard.validation.ts
import { z } from "zod";
import { DashboardMetricEnum } from "../../enums/DashboardMetric.enums";

export const baseDashboardSchema = z.object({
  userId: z.number(),
  roleName: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const getOverviewSchema = baseDashboardSchema;
export const getUserInsightsSchema = baseDashboardSchema;

export const getTrendsSchema = baseDashboardSchema.extend({
  metric: z.nativeEnum(DashboardMetricEnum).default(DashboardMetricEnum.BOOKINGS),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type getTrendsInput = z.infer<typeof getTrendsSchema>;

export const getEventInsightsSchema = z.object({
  userId: z.number({ required_error: "User ID is required" }),
  roleName: z.string().optional(),
});

export const getDishRatingsSchema = z.object({
  userId: z.number(),
  roleName: z.string().optional(),
  groupBy: z.enum(["category", "dish"]).default("category"),
  categoryId: z.string().optional(), // can come from query string
});

export type getDishRatingsInput = z.infer<typeof getDishRatingsSchema>;

export const getCategoriesSchema = z.object({
  userId: z.number(),
  roleName: z.string().optional(),
  search: z.string().trim().optional(),
  includeCounts: z.coerce.boolean().default(true),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type GetCategoriesInput = z.infer<typeof getCategoriesSchema>;

export const getMenuOverviewSchema = z.object({
  userId: z.number(),
  roleName: z.string(),
});

export const getDishDropAlertsSchema = z.object({
  userId: z.number(),
  roleName: z.string(),
  days: z.number().optional().default(7),
});

export const getRatingsSchema = baseDashboardSchema;
export const getFeedbackSchema = baseDashboardSchema;
export const getBenchmarkSchema = baseDashboardSchema;
