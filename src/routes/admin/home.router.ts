import { Router } from 'express';
import { HomeController } from '../../controllers/admin/home.controller';
import { authenticateJWTForAdmin } from '../../middlewares/admin.auth.middleware';

const AdminHomeRouter = Router();
AdminHomeRouter.get('/', (req, res) => {
  res.send('Hit Admin Home route');
});

AdminHomeRouter.use(authenticateJWTForAdmin);
AdminHomeRouter.get('/metrics', HomeController.metrics);
AdminHomeRouter.get('/upcomingBookings', HomeController.upcomingBookings);

export default AdminHomeRouter;
