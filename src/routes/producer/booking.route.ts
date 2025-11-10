import { Router } from 'express';
import { BookingController } from '../../controllers/producer/booking.controller';
import { authenticateBothJWT, checkStatus } from '../../middlewares/auth.middleware';

const ProducerBookingRouter = Router();
ProducerBookingRouter.get('/', (req, res) => {
  res.send('Hit Customer Booking route');
});

ProducerBookingRouter.use(authenticateBothJWT);
ProducerBookingRouter.use(checkStatus);

ProducerBookingRouter.post('/createBooking/:eventId', BookingController.createBooking);
ProducerBookingRouter.get('/getUserBookings', BookingController.getUserBookings);
ProducerBookingRouter.get('/booking/:id', BookingController.getBookingById);
ProducerBookingRouter.put('/cancelBooking/:id', BookingController.cancelBooking);
ProducerBookingRouter.put('/checkIn/:id', BookingController.checkIn);

ProducerBookingRouter.get('/getBookings', BookingController.getBookings);
ProducerBookingRouter.get('/getBooking/:id', BookingController.getBooking);
ProducerBookingRouter.put('/cancel/:id', BookingController.cancel);
// ProducerBookingRouter.put('/checkIn/:id', BookingController.checkIn);
ProducerBookingRouter.put('/updateBookingTemp/:id', BookingController.updateBookingTemp);

export default ProducerBookingRouter;
