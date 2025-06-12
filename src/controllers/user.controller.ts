import { NextFunction, Request, Response } from "express";
import UserService from "../services/user.service";
import { OnboardingInputSchema } from "../validators/user.validation";
import { z } from "zod";

const getOnboardingInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("getOnboardingInfo called", {}, "UserController");

    const user_id = req.user_id as number;

    const response = await UserService.getOnboardingInfo(user_id);

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in getOnboardingInfo", { error, body: req.body }, "UserController");

    next(error);
  }
};

const updateOnboardingInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("updateOnboardingInfo called", { body: req.body }, "UserController");

    const user_id = req.user_id as number;

    const validatedInput = OnboardingInputSchema.parse(req.body);

    const response = await UserService.updateOnboardingInfo(user_id, validatedInput);

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in updateOnboardingInfo", { error, body: req.body }, "UserController");

    next(error);
  }
};

const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("deleteAccount called", {}, "UserController");

    const user_id = req.user_id as number;

    const response = await UserService.deleteAccount(user_id);

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in deleteAccount", { error, body: req.body }, "UserController");

    next(error);
  }
};

const updateEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("updateEmail called", { body: req.body }, "UserController");

    const user_id = req.user_id as number;

    const validatedInput = z.string().email().parse(req.body.email);

    const response = await UserService.updateEmail(user_id, validatedInput);

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in updateEmail", { error, body: req.body }, "UserController");

    next(error);
  }
};

const verifyOTPForEmailChange = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("verifyOTPForEmailChange called", { body: req.body }, "UserController");

    const user_id = req.user_id as number;

    const validatedInput = z
      .string()
      .trim()
      .length(6)
      .refine((otp) => /^\d+$/.test(otp), {
        message: "Invalid OTP",
      })
      .parse(req.body.otp);

    const response = await UserService.verifyOTPForEmailChange(user_id, validatedInput);

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in verifyOTPForEmailChange", { error, body: req.body }, "UserController");

    next(error);
  }
};

const getSubscriptionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("getSubscriptionStatus called", {}, "UserController");

    const user_id = req.user_id as number;

    const response = await UserService.getSubscriptionStatus(user_id);

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in getSubscriptionStatus", { error, body: req.body }, "UserController");

    next(error);
  }
};

export default {
  deleteAccount,
  getOnboardingInfo,
  updateOnboardingInfo,
  updateEmail,
  verifyOTPForEmailChange,
  getSubscriptionStatus,
};
