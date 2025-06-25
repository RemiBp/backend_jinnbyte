import { Router } from 'express';
import { BookingController } from '../../controllers/producer/booking.controller';
import { authenticateJWTForRestaurant, checkStatus } from '../../middlewares/restaurant.auth.middleware';

const ProducerBookingRouter = Router();
ProducerBookingRouter.get('/', (req, res) => {
  res.send('Hit Customer Booking route');
});

ProducerBookingRouter.use(authenticateJWTForRestaurant);
ProducerBookingRouter.use(checkStatus);

ProducerBookingRouter.get('/getBookings', BookingController.getBookings);
ProducerBookingRouter.get('/getBooking/:id', BookingController.getBooking);
ProducerBookingRouter.put('/cancel/:id', BookingController.cancel);
ProducerBookingRouter.put('/checkIn/:id', BookingController.checkIn);
ProducerBookingRouter.put('/updateBookingTemp/:id', BookingController.updateBookingTemp);

export default ProducerBookingRouter;
