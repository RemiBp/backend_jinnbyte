// controllers/producer/dashboard.controller.ts
import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../../services/producer/dashboard.service";
import { getOverviewSchema, getUserInsightsSchema, getTrendsSchema, getRatingsSchema, getEventInsightsSchema, getDishRatingsSchema, getMenuOverviewSchema, getDishDropAlertsSchema, getCategoriesSchema } from "../../validators/producer/dashboard.validation";
import { sendApiResponse } from "../../utils/sendApiResponse";

export const getOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        const roleName = req.roleName;
        const parsed = getOverviewSchema.parse({ ...req.query, userId, roleName });
        const data = await DashboardService.getOverview(parsed);
        return sendApiResponse(res, 200, "Dashboard overview fetched successfully.", data);
    } catch (error) {
        next(error);
    }
};

export const getUserInsights = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        const roleName = req.roleName;
        const parsed = getUserInsightsSchema.parse({ ...req.query, userId, roleName });
        const data = await DashboardService.getUserInsights(parsed);
        return sendApiResponse(res, 200, "User insights fetched successfully.", data);
    } catch (error) {
        next(error);
    }
};

export const getTrends = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        const roleName = req.roleName;
        const parsed = getTrendsSchema.parse({ ...req.query, userId, roleName });
        const data = await DashboardService.getTrends(parsed);
        return sendApiResponse(res, 200, "Trends data fetched successfully.", data);
    } catch (error) {
        next(error);
    }
};

export const getRatings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        const roleName = req.roleName;
        const parsed = getRatingsSchema.parse({ ...req.query, userId, roleName });
        const data = await DashboardService.getRatings(parsed);
        return sendApiResponse(res, 200, "Ratings summary fetched successfully.", data);
    } catch (error) {
        next(error);
    }
};

export const getEventInsights = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        const roleName = req.roleName;
        const parsed = getEventInsightsSchema.parse({ ...req.query, userId, roleName });
        const data = await DashboardService.getEventInsights(parsed);
        return sendApiResponse(res, 200, "Event insights fetched successfully.", data);
    } catch (error) {
        next(error);
    }
};

export const getDishRatings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        const roleName = req.roleName;

        const parsed = getDishRatingsSchema.parse({ ...req.query, userId, roleName, });
        const data = await DashboardService.getDishRatings(parsed);
        return sendApiResponse(res, 200, "Dish ratings fetched successfully.", data);
    } catch (error) {
        next(error);
    }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        const roleName = req.roleName;

        const parsed = getCategoriesSchema.parse({
            ...req.query,
            userId,
            roleName
        });

        const data = await DashboardService.getCategories(parsed);

        return sendApiResponse(res, 200, "Categories fetched successfully.", data);
    } catch (error) {
        next(error);
    }
};

export const getMenuOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        const roleName = req.roleName;

        const parsed = getMenuOverviewSchema.parse({ ...req.query, userId, roleName });
        const data = await DashboardService.getMenuOverview(parsed);
        return sendApiResponse(res, 200, "Menu overview fetched successfully.", data);
    } catch (error) {
        next(error);
    }
};

export const getDishDropAlerts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        const roleName = req.roleName;
        const parsed = getDishDropAlertsSchema.parse({ ...req.query, userId, roleName });
        const data = await DashboardService.getDishDropAlerts(parsed);
        return sendApiResponse(res, 200, "Dish drop alerts fetched successfully.", data);
    } catch (error) {
        next(error);
    }
};

export * as DashboardController from './dashboard.controller';