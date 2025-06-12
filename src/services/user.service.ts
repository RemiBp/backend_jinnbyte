import Stripe from "stripe";
import { BadRequestError } from "../errors/badRequest.error";
import { NotFoundError } from "../errors/notFound.error";
import { CustomerRepository, OTPRepository, UserRepository } from "../repositories";
import { generateOTP } from "../utils/generateOTP";
import { OnboardingInput } from "../validators/user.validation";
import { sendEmailChangeCode, sendEmailOnAccountDeletion } from "./mail.service";
// import MailService from "./mail.service";
import s3Service from "./s3.service";
import { Customer } from "../models/Customer";

async function getOnboardingInfo(id: number) {
  try {
    console.log("getOnboardingInfo called", { id }, "UserService");

    const user = await UserRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundError("User not found");

    return {
      onboarding: user.onboarding,
      fullName: user.fullName,
      language: user.language,
      email: user.email,
      plan: user.plan,
      trial: user.trial,
      metadata: user.metadata,
    };
  } catch (error) {
    console.error("Error in getOnboardingInfo", { error }, "UserService");
    throw error;
  }
}

async function updateOnboardingInfo(id: number, OnboardingInfo: OnboardingInput) {
  try {
    console.log("updateOnboardingInfo called", { id, OnboardingInfo }, "UserService");

    const user = await UserRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundError("User not found");

    const updatedUser = await UserRepository.save({ ...user, ...OnboardingInfo });

    return {
      id: updatedUser.id,
      onboarding: updatedUser.onboarding,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      language: updatedUser.language,
      plan: updatedUser.plan,
      trial: updatedUser.trial,
      metadata: updatedUser.metadata,
    };
  } catch (error) {
    console.error("Error in updateOnboardingInfo", { error }, "UserService");
    throw error;
  }
}

async function deleteAccount(id: number) {
  try {
    console.log("deleteAccount called", { id }, "UserService");

    const user = await UserRepository.findOne({ where: { id }, relations: ["notes"] });
    if (!user) throw new NotFoundError("User not found");

    const { id: userID } = user;

    // if (user.SOME DATA) {
    //  DELETE ANY DATA TO COMPLY WITH EU LAWS
    //  DELETE ANY DATA TO COMPLY WITH EU LAWS
    //  DELETE ANY DATA TO COMPLY WITH EU LAWS
    //  DELETE ANY DATA TO COMPLY WITH EU LAWS
    //  DELETE ANY DATA TO COMPLY WITH EU LAWS
    //  DELETE ANY DATA TO COMPLY WITH EU LAWS
    //  DELETE ANY DATA TO COMPLY WITH EU LAWS
    //  DELETE ANY DATA TO COMPLY WITH EU LAWS
    //  DELETE ANY DATA TO COMPLY WITH EU LAWS
    // }

    await UserRepository.remove(user);

    sendEmailOnAccountDeletion(JSON.stringify(userID));

    return { message: "Account deleted successfully" };
  } catch (error) {
    console.error("Error in deleteAccount", { error }, "UserService");
    throw error;
  }
}

async function updateEmail(id: number, email: string) {
  try {
    console.log("updateEmail called", { id, email }, "UserService");

    // check if email isnt already in use
    const existingUser = await UserRepository.findOne({ where: { email } });

    if (existingUser) throw new BadRequestError("Email already in use");

    const otp = generateOTP(6);

    await OTPRepository.save({ otpCode: otp, user: { id }, purpose: "change_email", content: email });

    await sendEmailChangeCode(email, otp);

    return { message: "OTP sent. Check your email." };
  } catch (error) {
    console.error("Error in updateEmail", { error }, "UserService");
    throw error;
  }
}

async function verifyOTPForEmailChange(id: number, otp: string) {
  try {
    console.log("verifyOTPForEmailChange called", { id, otp }, "UserService");

    const otpRecord = await OTPRepository.findOne({ where: { otpCode: otp, user: { id }, purpose: "change_email" } });
    if (!otpRecord) throw new BadRequestError("Invalid OTP");

    const user = await UserRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundError("User not found");

    await UserRepository.save({ ...user, email: otpRecord.content });

    return { message: "Email updated successfully" };
  } catch (error) {
    console.error("Error in verifyOTPForEmailChange", { error }, "UserService");
    throw error;
  }
}

async function getSubscriptionStatus(user_id: number) {
  try {
    console.log("getSubscriptionStatus called", { user_id }, "UserService");

    const stripeObject = new Stripe(process.env.STRIPE_SECRET_KEY);

    const customerRecord = await CustomerRepository.findOne({ where: { user: { id: user_id } } });
    if (!customerRecord) return { status: "inactive", plan: null, trial: null, trialEnd: null, subscriptionEnd: null };
    const stripeCustomerId = customerRecord.stripeCustomerId;

    console.log("Stripe Customer ID", stripeCustomerId);

    if (!stripeCustomerId)
      return { status: "inactive", plan: null, trial: null, trialEnd: null, subscriptionEnd: null };

    const customer = await stripeObject.customers.retrieve(stripeCustomerId);

    const subscriptions = await stripeObject.subscriptions.list({ customer: stripeCustomerId });

    if (subscriptions.data.length === 0)
      return { status: "inactive", plan: null, trial: null, trialEnd: null, subscriptionEnd: null };

    const subscription = subscriptions.data[0];

    return {
      plan: subscription.items.data[0].plan.nickname,
      trialStatus:
        subscription.trial_end && new Date(subscription.trial_end * 1000) > new Date() ? "active" : "inactive",
      trialEnd:
        subscription.trial_end && new Date(subscription.trial_end * 1000) > new Date()
          ? new Date(subscription.trial_end * 1000)
          : null,
      status: subscription.status,
      subscriptionEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
    };
  } catch (error) {
    console.error("Error in getSubscriptionStatus", { error, user_id }, "UserService");
    throw error;
  }
}

export default {
  deleteAccount,
  getOnboardingInfo,
  updateOnboardingInfo,
  updateEmail,
  verifyOTPForEmailChange,
  getSubscriptionStatus,
};
