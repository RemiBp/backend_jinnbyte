import { Router } from 'express';
import { ProfileController } from '../../controllers/admin/profile.controller';
import { authenticateJWTForAdmin } from '../../middlewares/admin.auth.middleware';

const ProfileRouter = Router();
ProfileRouter.get('/', (req, res) => {
  res.send('Hit Admin profile route');
});

ProfileRouter.use(authenticateJWTForAdmin);
ProfileRouter.put('/updateProfile', ProfileController.updateProfile);
ProfileRouter.get('/getProfile', ProfileController.getProfile);
ProfileRouter.post('/getPreSignedUrl', ProfileController.getPreSignedUrl);
ProfileRouter.post('/getViewUrl', ProfileController.getViewUrl);
ProfileRouter.post('/uploadDocuments/:id', ProfileController.uploadDocuments);
ProfileRouter.get('/getHelpAndSupport', ProfileController.getHelpAndSupport);
ProfileRouter.put('/updateHelpAndSupport', ProfileController.updateHelpAndSupport);

export default ProfileRouter;
