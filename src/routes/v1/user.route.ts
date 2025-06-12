import { Router } from "express";
import UserController from "../../controllers/user.controller";
import { authenticateJWT } from "../../middlewares/auth.middleware";

const userRouter = Router();

userRouter.get("/", (req, res) => {
  res.send("Hit user route");
});

userRouter.use(authenticateJWT);

userRouter.get("/getOnboardingInfo", UserController.getOnboardingInfo);
userRouter.get("/getSubscriptionStatus", UserController.getSubscriptionStatus);
userRouter.put("/updateOnboardingInfo", UserController.updateOnboardingInfo);
userRouter.put("/updateEmail", UserController.updateEmail);
userRouter.put("/verifyOTPForEmailChange", UserController.verifyOTPForEmailChange);
userRouter.delete("/deleteAccount", UserController.deleteAccount);

export default userRouter;
