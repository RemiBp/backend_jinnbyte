import { Router } from 'express';
import { AuthController } from '../../controllers/admin/auth.controller';

const adminAuthRouter = Router();
adminAuthRouter.get('/', (req, res) => {
  res.send('Hit Admin auth route');
});

adminAuthRouter.post('/login', AuthController.login);

export default adminAuthRouter;
