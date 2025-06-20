import { DateTime } from 'luxon';
import { BadRequestError } from '../../errors/badRequest.error';
import { NotFoundError } from '../../errors/notFound.error';
import { BookingRepository, RestaurantRepository, RolesRepository, UserRepository } from '../../repositories';
import { GetRestaurantsSchema, UpdateAccountStatus } from '../../validators/admin/restaurant.validation';
import { In, LessThan, MoreThan, Not } from 'typeorm';
import { getCurrentTimeInUTCFromTimeZone } from '../../utils/getTime';

export const getRestaurants = async (getUsersObject: GetRestaurantsSchema) => {
  try {
    const { page, limit, keyword, status } = getUsersObject;

    const queryBuilder = UserRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.restaurant', 'restaurant')
      .leftJoinAndSelect('restaurant.cuisineType', 'cuisineType')
      .where('user.roleId = :roleId', { roleId: 3 })
      .andWhere('user.isDeleted = :isDeleted', { isDeleted: false });

    if (keyword) {
      queryBuilder.andWhere(
        `(user.email ILIKE :keyword OR
          user.phoneNumber ILIKE :keyword OR
          restaurant.restaurantName ILIKE :keyword)`,
        { keyword: `%${keyword}%` }
      );
    }

    if (status) {
      if (status === 'pending') {
        queryBuilder.andWhere('restaurant.accountStatus = :status', {
          status: 'underReview',
        });
      } else {
        queryBuilder.andWhere('restaurant.accountStatus = :status', { status });
      }
    }

    queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [restaurants, count] = await queryBuilder.getManyAndCount();

    return {
      restaurants: restaurants,
      count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  } catch (error) {
    throw error;
  }
};

export const getRestaurant = async (userId: number) => {
  try {
    const restaurant = await UserRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['restaurant', 'restaurant.cuisineType'],
    });
    return {
      restaurant: restaurant,
    };
  } catch (error) {
    throw error;
  }
};

export const getBookings = async (restaurantId: number, booking: string, timeZone: string, page = 1, limit = 10) => {
  try {
    let currentTime = getCurrentTimeInUTCFromTimeZone(timeZone);

    const restaurant = await UserRepository.findOne({
      where: {
        id: restaurantId,
      },
      relations: ['role'],
    });

    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    const restaurantRole = await RolesRepository.findOne({
      where: {
        name: 'restaurant',
      },
    });

    if (restaurant.role.id !== restaurantRole.id) {
      throw new BadRequestError('User is not a Restaurant');
    }
    let bookings: any[] = [];
    let total = 0;
    let totalPages = 0;

    switch (booking) {
      case 'scheduled':
        const scheduledBookings = await BookingRepository.findAndCount({
          where: {
            restaurant: {
              id: restaurant.id,
            },
            status: 'scheduled',
            endDateTime: MoreThan(currentTime),
          },
          relations: ['customer', 'restaurant', 'restaurant.restaurant'],
          order: {
            startDateTime: 'ASC',
          },
          skip: (page - 1) * limit,
          take: limit,
        });
        bookings = scheduledBookings[0] || [];
        total = scheduledBookings[1] || 0;
        totalPages = Math.ceil(scheduledBookings[1] / limit);
        break;

      case 'inProgress':
        let inProgressBookings = await BookingRepository.findOne({
          where: {
            restaurant: {
              id: restaurantId,
            },
            status: In(['inProgress']),
          },
          relations: ['customer', 'restaurant', 'restaurant.restaurant'],
          order: {
            id: 'DESC',
          },
        });
        bookings = inProgressBookings ? [inProgressBookings] : [];
        total = inProgressBookings ? 1 : 0;
        totalPages = 1;
        break;

      case 'completed':
        const now = DateTime.now().setZone(timeZone);
        const nowIso = now.toISO();
        const [bookingsToUpdate, countToUpdate] = await BookingRepository.findAndCount({
          where: {
            restaurant: {
              id: restaurantId,
            },
            endDateTime: LessThan(nowIso),
            status: Not(In(['scheduled', 'cancelled'])),
          },
          relations: ['customer', 'restaurant', 'restaurant.restaurant'],
          order: { id: 'DESC' },
          skip: (page - 1) * limit,
          take: limit,
        });
        const bookingIdsToUpdate = bookingsToUpdate
          .filter((booking: { status: string }) => booking.status !== 'completed')
          .map((booking: { id: any }) => booking.id);

        if (bookingIdsToUpdate.length > 0) {
          await BookingRepository.createQueryBuilder()
            .update()
            .set({ status: 'completed' })
            .whereInIds(bookingIdsToUpdate)
            .execute();
        }
        bookings = bookings = bookingsToUpdate.map((booking: any) => ({
          ...booking,
          status: 'completed',
        }));
        total = countToUpdate;
        totalPages = Math.ceil(total / limit);
        break;
      case 'cancel':
        const cancelledbookings = await BookingRepository.findAndCount({
          where: {
            restaurant: {
              id: restaurantId,
            },
            status: 'cancel',
          },
          relations: ['customer', 'restaurant', 'restaurant.restaurant'],
          order: {
            id: 'DESC',
          },
          skip: (page - 1) * limit,
          take: limit,
        });
        bookings = cancelledbookings[0] || [];
        total = cancelledbookings[1] || 0;
        totalPages = Math.ceil(total / limit);
        break;

      default:
        throw new BadRequestError('Invalid booking type requested');
    }
    return {
      bookings,
      total,
      currentPage: page,
      totalPages: totalPages,
    };
  } catch (error) {
    console.error(
      'Error in getBookings',
      {
        error,
      },
      'BookingService'
    );
    throw error;
  }
};

export const getBooking = async (restaurantId: number, bookingId: number, timeZone: string) => {
  try {
    if (!bookingId) {
      throw new BadRequestError('bookingId is required');
    }
    const restaurant = await UserRepository.findOne({
      where: {
        id: restaurantId,
      },
      relations: ['role'],
    });

    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    const restaurantRole = await RolesRepository.findOne({
      where: {
        name: 'restaurant',
      },
    });

    if (restaurant.role.id !== restaurantRole.id) {
      throw new BadRequestError('User is not a Restaurant');
    }
    const currentTimeInLocalZone = DateTime.now().setZone(timeZone);
    const formattedTime = currentTimeInLocalZone.toFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    let currentTime = new Date(formattedTime);
    const booking = await BookingRepository.findOne({
      where: {
        restaurant: {
          id: restaurantId,
        },
        id: bookingId,
      },
      relations: ['customer', 'restaurant', 'restaurant.restaurant'],
    });
    return {
      booking,
    };
  } catch (error) {
    console.error(
      'Error in getBooking',
      {
        error,
      },
      'BookingService'
    );
    throw error;
  }
};

export const updateAccountStatus = async (updateAccountStatusObject: UpdateAccountStatus) => {
  try {
    const { userId, accountStatus, rejectReason } = updateAccountStatusObject;
    const user = await UserRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new NotFoundError('User not found.');
    }
    const restaurant = await RestaurantRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }
    restaurant.accountStatus = accountStatus;
    restaurant.isActive = false;
    user.isActive = false;
    if (accountStatus === 'approved') {
      restaurant.isActive = true;
      user.isActive = true;
    }
    if (accountStatus === 'rejected') {
      restaurant.rejectReason = rejectReason;
    }

    await RestaurantRepository.save(restaurant);
    await UserRepository.save(user);

    return {
      message: 'Restaurant Account status updated successfully',
    };
  } catch (error) {
    throw error;
  }
};

export * as AdminRestaurantService from './restaurant.service';
