import { Router } from 'express';
import { AdminCuisineTypeController } from '../../controllers/admin/cuisineType.controller';
import { authenticateJWTForAdmin } from '../../middlewares/admin.auth.middleware';

const AdminCuisineTypeRouter = Router();
AdminCuisineTypeRouter.get('/', (req, res) => {
  res.send('Hit Admin CuisineType route');
});

AdminCuisineTypeRouter.use(authenticateJWTForAdmin);

AdminCuisineTypeRouter.post('/createCuisineType', AdminCuisineTypeController.createCuisineType);
AdminCuisineTypeRouter.get('/getCuisineTypes', AdminCuisineTypeController.getCuisineTypes);
AdminCuisineTypeRouter.get('/getCuisineType/:id', AdminCuisineTypeController.getCuisineType);
AdminCuisineTypeRouter.put('/updateCuisineType/:id', AdminCuisineTypeController.updateCuisineType);
AdminCuisineTypeRouter.delete('/deleteCuisineType/:id', AdminCuisineTypeController.deleteCuisineType);

export default AdminCuisineTypeRouter;
