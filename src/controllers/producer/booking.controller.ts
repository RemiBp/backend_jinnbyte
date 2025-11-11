import { NextFunction, Request, Response } from 'express';
import { BookingService } from '../../services/producer/booking.service';
import { bookingIdParamSchema, createBookingSchema } from '../../validators/producer/booking.validation';
import { sendApiResponse } from '../../utils/sendApiResponse';
import { BookingStatusEnums } from '../../enums/bookingStatus.enum';
import { BadRequestError } from '../../errors/badRequest.error';

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;

    const parsedData = createBookingSchema.parse({
      ...req.body,
      eventId: Number(req.params.eventId) || req.body.eventId,
    });

    const result = await BookingService.createBooking(userId, parsedData);

    return sendApiResponse(res, 201, "Booking created successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const timeZone = String(req.query.timeZone || "UTC");
    const status = String(req.query.status || "all"); //add status param

    const result = await BookingService.getBookingsByUser(userId, timeZone, status);

    return sendApiResponse(res, 200, "Bookings fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookingId = bookingIdParamSchema.parse(req.params).id;
    const userId = req.userId;

    const result = await BookingService.getBookingById(bookingId, userId);
    return sendApiResponse(res, 200, "Booking fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookingId = Number(req.params.id);
    const userId = req.userId;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      throw new BadRequestError("Cancel reason is required.");
    }

    const result = await BookingService.cancelBooking(bookingId, userId, reason);

    return sendApiResponse(res, 200, "Booking cancelled successfully", result);
  } catch (error) {
    next(error);
  }
};


export const checkIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookingId = Number(req.params.id);
    const userId = req.userId;
    if (!userId) {
      throw new BadRequestError("User ID is required for check-in");
    }
    const result = await BookingService.checkInBooking(bookingId, userId);
    return sendApiResponse(res, 200, "Checked in successfully", result);
  } catch (error) {
    next(error);
  }
};

// Old APIs
export const getBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const Booking = String(req.query.booking) || 'scheduled';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const userId = Number(req.userId);
    if (!Booking) {
      throw new Error('Booking is required');
    }
    const timeZone = String(req.query.timeZone);
    if (!timeZone) {
      throw new Error('timeZone is required');
    }
    const response = await BookingService.getBookings(userId, Booking, timeZone, page, limit);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.userId);
    const BookingId = Number(req.params.id);
    const timeZone = String(req.query.timeZone);
    if (!timeZone) {
      throw new Error('timeZone is required');
    }
    const response = await BookingService.getBooking(userId, BookingId, timeZone);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const cancel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.userId);
    const BookingId = Number(req.params.id);
    const cancelReason = String(req.body.cancelReason);
    const timeZone = req.query.timeZone ? String(req.query.timeZone) : undefined;
    if (!timeZone) {
      throw new Error('timeZone is required');
    }
    const response = await BookingService.cancel(userId, BookingId, cancelReason, timeZone);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// export const checkIn = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const userId = Number(req.userId);
//     const BookingId = Number(req.params.id);
//     const timeZone = req.query.timeZone ? String(req.query.timeZone) : undefined;
//     if (!timeZone) {
//       throw new Error('timeZone is required');
//     }
//     const response = await BookingService.checkIn(userId, BookingId, timeZone);
//     res.status(200).json(response);
//   } catch (error) {
//     next(error);
//   }
// };

export const updateBookingTemp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.userId);
    const bookingId = Number(req.params.id);
    const status = req.body.status;
    const startDateTime = req.body.startDateTime;
    const endDateTime = req.body.endDateTime;
    const response = await BookingService.updateBookingTemp(userId, bookingId, startDateTime, endDateTime, status);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export * as BookingController from './booking.controller';
