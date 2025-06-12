import { NextFunction, Request, Response } from "express";
import { AuthInputSchema, refreshAccessTokenSchema } from "../validators/auth.validation";
import AuthService from "../services/auth.service";

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("register called", { body: req.body }, "AuthController");

    const validatedInput = AuthInputSchema.parse(req.body);

    const response = await AuthService.register(validatedInput);

    res.status(201).json(response);
  } catch (error) {
    console.error("Error in register", { error, body: req.body }, "AuthController");

    next(error);
  }
};

const signin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("signin called", { body: req.body }, "AuthController");

    const validatedInput = AuthInputSchema.parse(req.body);

    const response = await AuthService.signin(validatedInput);

    res.status(201).json(response);
  } catch (error) {
    console.error("Error in signin", { error, body: req.body }, "AuthController");

    next(error);
  }
};

const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("VerifyOTP called", { body: req.body }, "AuthController");

    const response = await AuthService.verifyOTP(req.body);

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in verifyOTP", { error, body: req.body }, "AuthController");

    next(error);
  }
};

const resendOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("resendOTP called", { body: req.body }, "AuthController");

    const response = await AuthService.resendOTP(req.body);

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in resendOTP", { error, body: req.body }, "AuthController");

    next(error);
  }
};

const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("refreshAccessToken called", { body: req.body }, "AuthController");

    const validatedInput = refreshAccessTokenSchema.parse(req.body);

    const response = await AuthService.refreshAccessToken(validatedInput);

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in refreshAccessToken", { error, body: req.body }, "AuthController");

    next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("logout called", {}, "AuthController");

    const id = req.user_id as number;

    const validatedInput = refreshAccessTokenSchema.parse(req.body);

    const response = await AuthService.logout(id, validatedInput.refreshToken);

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in logout", { error, body: req.body }, "AuthController");

    next(error);
  }
};

export default {
  register,
  signin,
  verifyOTP,
  resendOTP,
  refreshAccessToken,
  logout,
};
