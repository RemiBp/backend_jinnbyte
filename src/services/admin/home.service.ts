import { BookingRepository, RestaurantRepository, UserRepository } from '../../repositories';
import s3Service from '../s3.service';
import { NotFoundError } from '../../errors/notFound.error';
import { PreSignedURL, UpdateProfileSchema, UploadDocuments } from '../../validators/admin/profile.validation';
import Booking from '../../models/booking';
import { start } from 'repl';
import { MoreThanOrEqual } from 'typeorm';
import { getCurrentTimeInUTCFromTimeZone, getTodayDateInTimeZone, toStartOfDay } from '../../utils/getTime';

export const metrics = async (userId: number) => {
  try {
    const user = await UserRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const totalCustomers = await UserRepository.count({
      where: {
        role: {
          id: '2',
        },
        isDeleted: false,
        isActive: true,
      },
    });

    const totalRestaurants = await UserRepository.count({
      where: {
        role: {
          id: '3',
        },
        isDeleted: false,
        isActive: true,
      },
    });
    const totalBookings = await BookingRepository.count({});

    return {
      totalCustomers,
      totalRestaurants,
      totalBookings,
    };
  } catch (error) {
    console.error('Error in getProfile', { error });
    throw error;
  }
};

export const upcomingBookings = async (
  userId: number,
  page: number,
  limit: number,
  timeZone: string,
  date?: string
) => {
  try {
    const user = await UserRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    let startTime = '';

    const todayDate = getTodayDateInTimeZone(timeZone);
    if (!date) {
      startTime = getCurrentTimeInUTCFromTimeZone(timeZone);
    }
    if (date) {
      if (date < todayDate) {
        throw new Error('Kindly select a future date');
      }
      const inputDate = date;
      const startOfDay = toStartOfDay(inputDate);
      startTime = startOfDay;
    }

    const [upcomingBookings, count] = await BookingRepository.findAndCount({
      where: {
        status: 'scheduled',
        startDateTime: MoreThanOrEqual(startTime),
      },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['customer', 'restaurant', 'restaurant.restaurant'],
    });

    return {
      upcomingBookings,
      count,
      currentPage: page,
      totalPage: Math.ceil(count / limit),
    };
  } catch (error) {
    console.error('Error in getProfile', { error });
    throw error;
  }
};

export * as HomeService from './home.service';
