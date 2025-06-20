import { Router } from 'express';
import { AuthController } from '../../controllers/app/auth.controller';

const UserAuthRouter = Router();
UserAuthRouter.get('/', (req, res) => {
  res.send('Hit user auth route');
});

UserAuthRouter.post('/register', AuthController.register);
UserAuthRouter.post('/login', AuthController.login);
UserAuthRouter.post('/verifyOtp', AuthController.verifyOtp);
UserAuthRouter.post('/resendSignUpOtp', AuthController.resendSignUpOtp);
UserAuthRouter.post('/forgotPassword', AuthController.forgotPassword);
UserAuthRouter.post('/resendForgotPasswordOtp', AuthController.resendForgotPasswordOtp);
UserAuthRouter.post('/verifyForgotPasswordOtp', AuthController.verifyForgotPasswordOtp);
UserAuthRouter.post('/resetPassword', AuthController.resetPassword);
UserAuthRouter.post('/refreshAccessToken', AuthController.refreshAccessToken);
UserAuthRouter.post('/socialLogin', AuthController.socialLogin);
UserAuthRouter.post('/checkTokenDetails', AuthController.checkTokenDetails);

export default UserAuthRouter;
