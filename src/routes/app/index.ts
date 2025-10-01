import { Router } from 'express';
import UserAuthRouter from './auth.router';
import UserProfileRouter from './profile.router';
import BookingRouter from './booking.route';
import BookMarkRouter from './bookmark.routes';

const AppRouter = Router();
AppRouter.get('/', (req, res) => {
  res.send('Hit App route');
});

AppRouter.use('/auth', UserAuthRouter);
AppRouter.use('/profile', UserProfileRouter);
AppRouter.use('/booking', BookingRouter);
AppRouter.use('/bookmark', BookMarkRouter);

export default AppRouter;
