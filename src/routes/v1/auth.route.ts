import { Router } from "express";
import AuthController from "../../controllers/auth.controller";
import { authenticateJWT } from "../../middlewares/auth.middleware";

const authRouter = Router();

authRouter.get("/", (req, res) => {
  res.send("Hit auth route");
});

authRouter.post("/register", AuthController.register);
authRouter.post("/signin", AuthController.signin);
authRouter.post("/verifyOTP", AuthController.verifyOTP);
authRouter.post("/resendOTP", AuthController.resendOTP);
authRouter.post("/refreshAccessToken", AuthController.refreshAccessToken);
authRouter.post("/logout", authenticateJWT, AuthController.logout);

export default authRouter;
