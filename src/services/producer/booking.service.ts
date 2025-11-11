import {
  BookingRepository,
  EventBookingRepository,
  EventRepository,
  NotificationRepository,
  RolesRepository,
  UserRepository,
} from '../../repositories';
import { BadRequestError } from '../../errors/badRequest.error';
import { NotFoundError } from '../../errors/notFound.error';
import { In, LessThan, MoreThan, Not } from 'typeorm';
import { NotificationTypeEnums } from '../../enums/notification.type.enum';
import { NotificationStatusCode } from '../../enums/NotificationStatusCode.enum';
import { getCurrentTimeInUTCFromTimeZone } from '../../utils/getTime';
import { sendAdminNotification } from '../../utils/sendAdminNotification';
import { UnauthorizedError } from '../../errors/unauthorized.error';
import { BookingStatusEnums } from '../../enums/bookingStatus.enum';
import { createBookingInput } from '../../validators/producer/booking.validation';
import { DateTime } from 'luxon';

export const createBooking = async (userId: number, data: createBookingInput) => {
  const { eventId, guestCount } = data;

  const event = await EventRepository.findOneBy({ id: eventId });
  if (!event || event.isDeleted) throw new NotFoundError("Event not found");
  if (!event.isActive) throw new BadRequestError("This event is not active.");

  // combine event date + time to check if event is already over
  const eventEnd = new Date(`${event.date}T${event.endTime}Z`);
  const now = new Date(getCurrentTimeInUTCFromTimeZone("UTC"));

  if (eventEnd <= now) {
    throw new BadRequestError("This event has already ended. Booking is not allowed.");
  }

  // Capacity check
  const totalBooked = await EventBookingRepository.createQueryBuilder("booking")
    .select("SUM(booking.numberOfPersons)", "sum")
    .where("booking.eventId = :eventId AND booking.status != :status", {
      eventId,
      status: BookingStatusEnums.CANCEL,
    })
    .getRawOne();

  const currentCount = Number(totalBooked.sum) || 0;
  if (event.maxCapacity && currentCount + guestCount > event.maxCapacity) {
    throw new BadRequestError("Booking exceeds event capacity");
  }

  // Pricing logic
  const totalPrice = guestCount * Number(event.pricePerGuest || 0);

  // Create booking
  const booking = EventBookingRepository.create({
    user: { id: userId },
    event: { id: eventId },
    numberOfPersons: guestCount,
    totalPrice,
    status: BookingStatusEnums.SCHEDULED, // Upcoming by default
  });

  await EventBookingRepository.save(booking);

  return {
    message: "Booking confirmed",
    bookingId: booking.id,
    totalAmount: totalPrice,
    status: booking.status,
  };
};

export const getBookingsByUser = async (userId: number, timeZone?: string, status: string = "all") => {
  // Validate user
  const user = await UserRepository.findOne({
    where: { id: userId },
    relations: ["role"],
  });
  if (!user) throw new NotFoundError("User not found");

  const roleName = user.role?.name?.toLowerCase();
  const isProducer = ["restaurant", "producer", "leisure", "wellness"].includes(roleName);

  const now = DateTime.now().setZone(timeZone || "UTC");

  // Auto-complete expired in-progress bookings
  await EventBookingRepository.query(`
    UPDATE "EventBookings" eb
    SET "status" = 'completed'
    FROM "Events" e
    WHERE e.id = eb."eventId"
    AND eb."status" = 'inProgress'
    AND (
      (TO_TIMESTAMP(e.date || ' ' || e."endTime", 'YYYY-MM-DD HH24:MI') AT TIME ZONE e."timeZone")
      <= (NOW() AT TIME ZONE 'UTC')
    )
  `);

  await EventBookingRepository.query(`DISCARD ALL;`);

  // Load all bookings
  const whereCondition = isProducer
    ? { event: { producer: { user: { id: userId } } } }
    : { user: { id: userId } };

  const bookings = await EventBookingRepository.find({
    where: whereCondition,
    relations: ["event", "event.producer", "event.producer.user"],
    order: { createdAt: "DESC" },
  });

  // Map cleanly without manual reconstruction
  const results = await Promise.all(
    bookings.map(async (booking: any) => {
      const event = booking.event;
      const producer = event.producer;
      const eventZone = event.timeZone || "UTC";

      const eventStart = DateTime.fromISO(`${event.date}T${event.startTime}`, { zone: eventZone });
      const eventEnd = DateTime.fromISO(`${event.date}T${event.endTime}`, { zone: eventZone });
      const nowUTC = now.toUTC();

      // Auto move to completed if ended
      if (booking.status === BookingStatusEnums.IN_PROGRESS && nowUTC > eventEnd.toUTC()) {
        booking.status = BookingStatusEnums.COMPLETED;
        await EventBookingRepository.update(booking.id, {
          status: BookingStatusEnums.COMPLETED,
        });
      }

      // Return the direct 3-part structure
      return {
        booking: {
          ...booking,
          canCheckIn:
            booking.status === BookingStatusEnums.SCHEDULED &&
            nowUTC >= eventStart.toUTC() &&
            nowUTC <= eventEnd.toUTC(),
          canCancel:
            booking.status === BookingStatusEnums.SCHEDULED ||
            booking.status === BookingStatusEnums.IN_PROGRESS,
        },
        // event,
        producer,
      };
    })
  );

  // Optional filtering by status tab
  const filtered =
    status === "all"
      ? results
      : results.filter(({ booking }) => {
        switch (status) {
          case "scheduled": return booking.status === BookingStatusEnums.SCHEDULED;
          case "inProgress": return booking.status === BookingStatusEnums.IN_PROGRESS;
          case "completed": return booking.status === BookingStatusEnums.COMPLETED;
          case "cancelled": return booking.status === BookingStatusEnums.CANCEL;
          default: return true;
        }
      });

  return filtered;
};

export const getBookingById = async (id: number, userId: number) => {
  const booking = await EventBookingRepository.findOne({
    where: { id },
    relations: ['user', 'event'],
  });

  if (!booking) throw new NotFoundError('Booking not found');
  if (booking.user.id !== userId) throw new UnauthorizedError('You do not have access to this booking');

  return booking;
};

export const cancelBooking = async (bookingId: number, userId: number, reason: string) => {
  const booking = await EventBookingRepository.findOne({
    where: { id: bookingId },
    relations: ["user", "event"],
  });

  if (!booking) throw new NotFoundError("Booking not found");
  if (booking.user.id !== userId) throw new UnauthorizedError("You do not own this booking");

  // Validate current status
  if (booking.status === BookingStatusEnums.CANCEL) {
    throw new BadRequestError("Booking is already cancelled");
  }
  if (booking.status === BookingStatusEnums.COMPLETED) {
    throw new BadRequestError("Completed bookings cannot be cancelled");
  }
  if (booking.status === BookingStatusEnums.IN_PROGRESS) {
    throw new BadRequestError("You cannot cancel an ongoing event booking");
  }

  // Prevent cancellation if event already ended
  const event = booking.event;
  const now = new Date(getCurrentTimeInUTCFromTimeZone("UTC"));
  const eventEnd = new Date(`${event.date}T${event.endTime}Z`);

  if (eventEnd <= now) {
    throw new BadRequestError("You cannot cancel — this event has already ended");
  }

  // Update booking status and record reason
  booking.status = BookingStatusEnums.CANCEL;
  booking.internalNotes = reason;

  await EventBookingRepository.save(booking);

  return {
    bookingId: booking.id,
    reason,
    status: booking.status,
  };
};

export const checkInBooking = async (id: number, userId: number) => {
  // Load booking with linked event + producer + user
  const booking = await EventBookingRepository.findOne({
    where: { id },
    relations: ["user", "event", "event.producer", "event.producer.user"],
  });

  if (!booking) throw new NotFoundError("Booking not found");

  const event = booking.event;

  // Determine if current user is allowed
  const isUserOwner = booking.user.id === userId;
  const isProducerOwner = event.producer?.user?.id === userId;

  if (!isUserOwner && !isProducerOwner) {
    throw new UnauthorizedError("You are not authorized to check in this booking");
  }

  // Use event’s own timezone for validation
  const eventZone = event.timeZone || "UTC";
  const now = DateTime.now().setZone(eventZone);
  const eventStart = DateTime.fromISO(`${event.date}T${event.startTime}`, { zone: eventZone });
  const eventEnd = DateTime.fromISO(`${event.date}T${event.endTime}`, { zone: eventZone });

  // Not allowed if cancelled or completed
  if (booking.status === BookingStatusEnums.CANCEL) {
    throw new BadRequestError("You cannot check in for a cancelled booking");
  }
  if (booking.status === BookingStatusEnums.COMPLETED) {
    throw new BadRequestError("This event is already completed");
  }

  // Too early
  if (now < eventStart) {
    throw new BadRequestError("You cannot check in before the event starts");
  }

  // Too late
  if (now > eventEnd) {
    throw new BadRequestError("You cannot check in after the event has ended");
  }

  // Valid check-in → move to IN_PROGRESS
  booking.status = BookingStatusEnums.IN_PROGRESS;
  await EventBookingRepository.save(booking);

  return {
    message: isUserOwner
      ? "User check-in successful"
      : "Producer check-in successful",
    bookingId: booking.id,
    status: booking.status,
    event: {
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      timeZone: eventZone,
    },
  };
};

export const getBookings = async (userId: number, booking: string, timeZone: string, page = 1, limit = 10) => {
  try {
    let currentTime = getCurrentTimeInUTCFromTimeZone(timeZone);
    const user = await UserRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const userRole = await RolesRepository.findOne({
      where: {
        name: 'restaurant',
      },
    });

    if (user.role.id !== userRole.id) {
      throw new BadRequestError('User is not a Restaurant');
    }
    let bookings: any[] = [];
    let total = 0;
    let totalPages = 0;
    let canCancel = false;
    let canCheckIn = false;
    const nowIso = getCurrentTimeInUTCFromTimeZone(timeZone);
    const bookingsToUpdate = await BookingRepository.find({
      where: {
        restaurant: { id: user.id },
        endDateTime: LessThan(nowIso),
        status: 'scheduled'
      },
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const bookingIdsToUpdate = bookingsToUpdate
      .map((booking: { id: any }) => booking.id);

    if (bookingIdsToUpdate.length > 0) {
      await BookingRepository.createQueryBuilder()
        .update()
        .set({ status: 'cancelled', cancelReason: 'Cancelled by system because its overdue and no action was taken' })
        .whereInIds(bookingIdsToUpdate)
        .execute();
    }

    switch (booking) {
      case 'scheduled':
        const scheduledBookings = await BookingRepository.findAndCount({
          where: {
            restaurant: {
              id: user.id,
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
        const mapScheduledBookings = scheduledBookings[0].map((booking: { status: string; startDateTime: string; endDateTime: string }) => {
          if (booking.status === 'scheduled') {
            canCancel = true;
          }
          if (booking.startDateTime <= currentTime && booking.endDateTime > currentTime) {
            canCheckIn = true;
          }

          return { ...booking, canCancel, canCheckIn };
        });
        bookings = mapScheduledBookings || [];
        total = scheduledBookings[1] || 0;
        totalPages = Math.ceil(total / limit);
        break;

      case 'inProgress':
        let inProgressBookings = await BookingRepository.findAndCount({
          where: {
            restaurant: {
              id: user.id,
            },
            status: In(['inProgress']),
          },
          relations: ['customer', 'restaurant', 'restaurant.restaurant'],
          order: {
            id: 'DESC',
          },
        });
        const inProgressBookingMap = inProgressBookings[0].map((booking: { status: string }) => {
          canCancel = true;
          canCheckIn = false;
          return { ...booking, canCancel, canCheckIn };
        });
        bookings = inProgressBookingMap ? inProgressBookingMap : [];
        total = inProgressBookings[1] || 0;
        totalPages = Math.ceil(total / limit);
        break;

      case 'completed':
        const nowIso = getCurrentTimeInUTCFromTimeZone(timeZone);
        const [bookingsToUpdate, countToUpdate] = await BookingRepository.findAndCount({
          where: {
            restaurant: { id: user.id },
            endDateTime: LessThan(nowIso),
            status: Not(In(['cancelled', 'scheduled'])),
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
        bookings = bookingsToUpdate.map((booking: any) => ({
          ...booking,
          status: 'completed',
          canCancel: false,
          canCheckIn: false,
        }));
        total = countToUpdate;
        totalPages = Math.ceil(total / limit);
        break;
      case 'cancelled':
        const cancelledbookings = await BookingRepository.findAndCount({
          where: {
            restaurant: {
              id: user.id,
            },
            status: 'cancelled',
          },
          relations: ['customer', 'restaurant', 'restaurant.restaurant'],
          order: {
            id: 'DESC',
          },
          skip: (page - 1) * limit,
          take: limit,
        });
        const mapCancelledBookings = cancelledbookings[0].map((booking: { status: string; startDateTime: string }) => {
          let canCancel = false;
          let canCheckIn = false;
          return { ...booking, canCancel, canCheckIn };
        });
        bookings = mapCancelledBookings || [];
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

export const getBooking = async (userId: number, bookingId: number, timeZone: string) => {
  try {
    if (!bookingId) {
      throw new BadRequestError('bookingId is required');
    }
    const user = await UserRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const userRole = await RolesRepository.findOne({
      where: {
        name: 'restaurant',
      },
    });

    if (user.role.id !== userRole.id) {
      throw new BadRequestError('User is not a restaurant');
    }
    let currentTime = getCurrentTimeInUTCFromTimeZone(timeZone);
    let scheduled = false;
    let inProgress = false;
    let cancelled = false;
    let canCancel = false;
    let completed = false;
    let canCheckIn = false;
    const booking = await BookingRepository.findOne({
      where: {
        restaurant: {
          id: user.id,
        },
        id: bookingId,
      },
      relations: ['customer', 'restaurant', 'restaurant.restaurant', 'review'],
    });
    if (!booking) {
      return {
        booking: null,
      }
    }
    if (booking.status === 'scheduled') {
      canCancel = true;
      scheduled = true;
    }

    if (booking.status === 'inProgress') {
      inProgress = true;
      canCancel = true;
    }

    if (booking.status === 'completed') {
      completed = true;
      inProgress = false;
    }
    if (booking.status === 'cancelled') {
      cancelled = true;
      canCancel = false;
    }
    if (booking.status === 'scheduled' && booking.endDateTime > currentTime) {
      canCheckIn = true;
    }
    const bookingResponse = {
      ...booking,
      canCheckIn,
      scheduled,
      inProgress,
      canCancel,
      cancelled,
      completed,
      start: booking.startDateTime,
      currentTime
    };
    return {
      booking: bookingResponse,
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

export const cancel = async (userId: number, bookingId: number, cancelReason: string, timeZone: string) => {
  try {
    const user = await UserRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['role', 'restaurant'],
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const userRole = await RolesRepository.findOne({
      where: {
        name: 'restaurant',
      },
    });
    if (user.role.id !== userRole.id) {
      throw new BadRequestError('User is not a Restaurant');
    }

    let currentTime = getCurrentTimeInUTCFromTimeZone(timeZone);
    const booking = await BookingRepository.findOne({
      where: {
        restaurant: {
          id: user.id,
        },
        id: bookingId,
      },
      relations: ['customer', 'restaurant', 'restaurant.restaurant'],
    });
    if (!booking) {
      throw new NotFoundError('booking not found');
    }
    if (booking.status === 'cancelled') {
      throw new BadRequestError('booking is already cancelled');
    }
    if (booking.status !== 'scheduled') {
      throw new BadRequestError('booking cannot be cancelled');
    }
    booking.status = 'cancelled';
    booking.cancelBy = 'restaurant';
    booking.cancelReason = cancelReason;
    booking.cancelAt = currentTime;
    await BookingRepository.save(booking);

    const bookingResponse = {
      ...booking,
    };

    const convertBookingDateToDDMMYY = (booking.startDateTime.split('T')[0].split('-').reverse().join('-'));

    if (booking.customer.deviceId) {
      const notificationData = {
        sender: { id: userId },
        receiver: { id: booking.customer.id },
        notificationId: NotificationStatusCode.BOOKING_RESTAURANT_CANCELLED,
        jobId: bookingId,
        title: 'Reservation Canceled by Restaurant',
        body: `We’re sorry! Your reservation at ${booking.restaurant.restaurant.restaurantName} scheduled for ${convertBookingDateToDDMMYY} has been canceled by the restaurant.Please consider booking another time.`,
        type: NotificationTypeEnums.BOOKING_RESTAURANT_CANCELLED,
        purpose: NotificationTypeEnums.BOOKING_RESTAURANT_CANCELLED,
        restaurantName: booking.restaurant.restaurant.restaurantName,
      };
      const notification = NotificationRepository.create(notificationData);
      await NotificationRepository.save(notification);
      const notificationPayload = {
        notificationId: String(NotificationStatusCode.BOOKING_RESTAURANT_CANCELLED),
        bookingId: String(booking.id),
        type: NotificationTypeEnums.BOOKING_RESTAURANT_CANCELLED,
        userId: String(user.id),
        profilePicture: String(user.profilePicture),
        name: String(booking.restaurant.restaurant.restaurantName),
      };
      await sendAdminNotification(
        booking.customer.deviceId,
        "Reservation Canceled by Restaurant",
        `We’re sorry! Your reservation at ${booking.restaurant.restaurant.restaurantName} scheduled for ${convertBookingDateToDDMMYY} has been canceled by the restaurant. 
          Please consider booking another time.`,
        notificationPayload,
      );
    }

    return {
      booking: bookingResponse,
    };
  } catch (error) {
    console.error(
      'Error in cancel',
      {
        error,
      },
      'BookingService'
    );
    throw error;
  }
};

export const checkIn = async (userId: number, bookingId: number, timeZone: string) => {
  try {
    if (!timeZone) {
      throw new Error('timeZone is required');
    }

    const user = await UserRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const userRole = await RolesRepository.findOne({
      where: {
        name: 'restaurant',
      },
    });
    if (user.role.id !== userRole.id) {
      throw new BadRequestError('User is not a restaurant');
    }

    let currentTime = getCurrentTimeInUTCFromTimeZone(timeZone);
    const booking = await BookingRepository.findOne({
      where: {
        restaurant: {
          id: user.id,
        },
        id: bookingId,
      },
      relations: ['customer', 'restaurant', 'restaurant.restaurant'],
    });
    if (!booking) {
      throw new NotFoundError('booking not found');
    }
    if (booking.status === 'inProgress') {
      throw new BadRequestError('booking is already inProgress');
    }
    if (booking.status !== 'scheduled') {
      throw new BadRequestError('booking cannot be checkedIn');
    }
    // if (booking.startDateTime > currentTime) {
    //   throw new BadRequestError('booking cannot be checkedIn as it has not started yet');
    // }
    if (booking.endDateTime < currentTime) {
      throw new BadRequestError('booking cannot be checkedIn as it has already ended');
    }
    booking.status = 'inProgress';
    booking.checkInAt = currentTime;
    await BookingRepository.save(booking);

    const bookingResponse = {
      ...booking,
    };
    const convertBookingDateToDDMMYY = (booking.startDateTime.split('T')[0].split('-').reverse().join('-'));

    if (booking.customer.deviceId) {
      const notificationData = {
        sender: { id: userId },
        receiver: { id: booking.customer.id },
        notificationId: NotificationStatusCode.BOOKING_CUSTOMER_CHECKIN,
        jobId: bookingId,
        title: 'Customer Checked-In',
        body: `${booking.customer.firstName} has checked-in the booking scheduled for ${convertBookingDateToDDMMYY}.`,
        type: NotificationTypeEnums.BOOKING_CUSTOMER_CHECKIN,
        purpose: NotificationTypeEnums.BOOKING_CUSTOMER_CHECKIN,
        restaurantName: booking.restaurant.restaurant.restaurantName,
      };
      const notification = NotificationRepository.create(notificationData);
      await NotificationRepository.save(notification);
      const notificationPayload = {
        notificationId: String(NotificationStatusCode.BOOKING_CUSTOMER_CHECKIN),
        bookingId: String(booking.id),
        type: NotificationTypeEnums.BOOKING_CUSTOMER_CHECKIN,
        userId: String(booking.customer.id),
        profilePicture: String(booking.customer.profilePicture),
        name: String(booking.restaurant.restaurant.restaurantName),
      };

      await sendAdminNotification(
        booking.customer.deviceId,
        "Customer Checked-in",
        `${booking.customer.firstName} has checked-in the booking scheduled for ${convertBookingDateToDDMMYY}.`,
        notificationPayload,
      );
    }
    return {
      booking: bookingResponse,
    };
  } catch (error) {
    console.error(
      'Error in cancel',
      {
        error,
      },
      'BookingService'
    );
    throw error;
  }
};

export const updateBookingTemp = async (
  userId: number,
  bookingId: number,
  startDateTime: string,
  endDateTime: string,
  status: string
) => {
  try {
    const booking = await BookingRepository.findOne({
      where: {
        id: bookingId,
      },
    });
    if (!booking) {
      throw new NotFoundError('booking not found');
    }
    booking.startDateTime = startDateTime;
    booking.endDateTime = endDateTime;
    booking.status = status;
    booking.pictureProof = null;
    await BookingRepository.save(booking);
  } catch (error) {
    console.error(
      'Error in updateBookingTemp',
      {
        error,
      },
      'BookingService'
    );
    throw error;
  }
};

export * as BookingService from './booking.service';
