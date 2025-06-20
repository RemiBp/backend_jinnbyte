import { Router } from 'express';
import { UserController } from '../../controllers/admin/user.controller';
import { authenticateJWTForAdmin } from '../../middlewares/admin.auth.middleware';

const adminUserRouter = Router();
adminUserRouter.get('/', (req, res) => {
  res.send('Hit Admin User route');
});

adminUserRouter.use(authenticateJWTForAdmin);

adminUserRouter.get('/getUsers', UserController.getUsers);
adminUserRouter.get('/getUser/:id', UserController.getUser);
adminUserRouter.put('/updateUserStatus/:id', UserController.updateUserStatus);
adminUserRouter.delete('/deleteUser/:id', UserController.deleteUser);

export default adminUserRouter;
