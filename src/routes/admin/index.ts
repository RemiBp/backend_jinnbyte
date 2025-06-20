import { Router } from 'express';
import adminAuthRouter from './auth.route';
import adminUserRouter from './user.route';
import AdminRestaurantRouter from './restaurant.route';
import AdminCuisineTypeRouter from './cuisineType.route';
import ProfileRouter from './profile.router';
import AdminHomeRouter from './home.router';

const adminRouter = Router();

adminRouter.get('/', (req, res) => {
  res.send('Hit Admin route');
});

adminRouter.use('/auth', adminAuthRouter);
adminRouter.use('/user', adminUserRouter);
adminRouter.use('/restaurant', AdminRestaurantRouter);
adminRouter.use('/cuisineType', AdminCuisineTypeRouter);
adminRouter.use('/profile', ProfileRouter);
adminRouter.use('/home', AdminHomeRouter);

export default adminRouter;
