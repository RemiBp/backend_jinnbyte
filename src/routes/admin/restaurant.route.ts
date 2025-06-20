import { Router } from 'express';
import { AdminRestaurantController } from '../../controllers/admin/restaurant.controller';
import { authenticateJWTForAdmin } from '../../middlewares/admin.auth.middleware';

const AdminRestaurantRouter = Router();
AdminRestaurantRouter.get('/', (req, res) => {
  res.send('Hit Admin Restaurant route');
});

AdminRestaurantRouter.use(authenticateJWTForAdmin);

AdminRestaurantRouter.get('/getRestaurants', AdminRestaurantController.getRestaurants);
AdminRestaurantRouter.get('/getRestaurant/:id', AdminRestaurantController.getRestaurant);
AdminRestaurantRouter.get('/getBookings/:id', AdminRestaurantController.getBookings);
AdminRestaurantRouter.get('/getBooking/:id', AdminRestaurantController.getBooking);
AdminRestaurantRouter.put('/updateAccountStatus/:id', AdminRestaurantController.updateAccountStatus);

export default AdminRestaurantRouter;
