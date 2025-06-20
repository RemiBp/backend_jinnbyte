import { NextFunction, Request, Response } from 'express';
import { updateProfileSchema } from '../../validators/admin/profile.validation';
import { HomeService } from '../../services/admin/home.service';

export const metrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new Error('userId is required');
    }
    const response = await HomeService.metrics(userId);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const upcomingBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const timeZone = req.query.timeZone ? String(req.query.timeZone) : undefined;
    if (!timeZone) {
      throw new Error('timeZone is required');
    }
    const date = req.query.date ? String(req.query.date) : undefined;
    const userId = req.userId;
    if (!userId) {
      throw new Error('userId is required');
    }
    const response = await HomeService.upcomingBookings(userId, page, limit, timeZone, date);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export * as HomeController from './home.controller';
