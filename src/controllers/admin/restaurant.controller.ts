import { NextFunction, Request, Response } from 'express';
import { AdminRestaurantService } from '../../services/admin/restaurant.service';
import { getRestaurantsSchema, updateAccountStatusSchema } from '../../validators/admin/restaurant.validation';

export const getRestaurants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = String(req.query.status);
    const keyword = req.query.keyword;
    const validatedObject = getRestaurantsSchema.parse({
      page,
      limit,
      keyword,
      status,
    });
    const response = await AdminRestaurantService.getRestaurants(validatedObject);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getRestaurant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.params.id);
    if (!userId) {
      throw new Error('UserId is required');
    }
    const response = await AdminRestaurantService.getRestaurant(userId);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const Booking = req.query.booking ? String(req.query.booking) : 'inProgress';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const restaurantId = Number(req.params.id);
    if (!Booking) {
      throw new Error('Booking is required');
    }
    const timeZone = String(req.query.timeZone);
    if (!timeZone) {
      throw new Error('timeZone is required');
    }
    const response = await AdminRestaurantService.getBookings(restaurantId, Booking, timeZone, page, limit);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const restaurantId = Number(req.params.id);
    const bookingId = Number(req.query.bookingId);
    const timeZone = String(req.query.timeZone);
    if (!timeZone) {
      throw new Error('timeZone is required');
    }
    const response = await AdminRestaurantService.getBooking(restaurantId, bookingId, timeZone);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateAccountStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.params.id);
    const accountStatus = req.body.accountStatus;
    const rejectReason = req.body.rejectReason;
    const validatedObject = updateAccountStatusSchema.parse({
      userId,
      accountStatus,
      rejectReason,
    });
    const response = await AdminRestaurantService.updateAccountStatus(validatedObject);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export * as AdminRestaurantController from './restaurant.controller';
