import { AuthInput, RefreshAccessTokenInput, VerifyOTPInput } from "../validators/auth.validation";
import { UserRepository, OTPRepository } from "../repositories";
import { sendLoginCode } from "./mail.service";
import { generateOTP } from "../utils/generateOTP";
import { BadRequestError } from "../errors/badRequest.error";
import { NotFoundError } from "../errors/notFound.error";
import { generateJWTPair, verifyRefreshJWT } from "../utils/generateJWT";
import { addMinutes, isAfter, isBefore } from "date-fns";
import { IsNull, Not } from "typeorm";

async function register(registerInput: AuthInput) {
  try {
    console.log("register called", { registerInput }, "AuthService");

    const user = await UserRepository.findOne({
      where: {
        email: registerInput.email.toLowerCase(),
      },
    });

    if (user) {
      if (user.email_verified_at) throw new BadRequestError("This email is already registered");
      const loginCode = generateOTP(6);
      await OTPRepository.save({ otpCode: loginCode, user: user, purpose: "register" });
      await sendLoginCode(user.email, loginCode, "registration");
    } else {
      const newUser = await UserRepository.save({ email: registerInput.email.toLowerCase() });
      const loginCode = generateOTP(6);
      await OTPRepository.save({ otpCode: loginCode, user: newUser, purpose: "register" });
      await sendLoginCode(newUser.email, loginCode, "registration");
    }

    return { message: "OTP sent. Check your email." };
  } catch (error) {
    console.error("Error in register", { error, body: registerInput }, "AuthService");

    throw error;
  }
}

async function signin(signinInput: AuthInput) {
  try {
    console.log("signin called", { signinInput }, "AuthService");

    const user = await UserRepository.findOne({
      where: {
        email: signinInput.email.toLowerCase(),
        email_verified_at: Not(IsNull()),
      },
    });

    if (!user) throw new NotFoundError("No account with this email exists");

    const loginCode = generateOTP(6);

    await OTPRepository.save({ otpCode: loginCode, user: user, purpose: "signin" });

    await sendLoginCode(user.email, loginCode, "login");

    return { message: "OTP sent. Check your email." };
  } catch (error) {
    console.error("Error in signin", { error, body: signinInput }, "AuthService");

    throw error;
  }
}

async function verifyOTP(verifyOTPInput: VerifyOTPInput) {
  try {
    console.log("VerifyOTP called", { verifyOTPInput }, "AuthService");

    const thirtyMinutesAgo = addMinutes(new Date(), -30);

    const otp = await OTPRepository.createQueryBuilder("otp")
      .leftJoinAndSelect("otp.user", "user")
      .select([
        "otp.otpCode",
        "otp.created_at",
        "otp.isUsed",
        "otp.purpose",
        "user.id",
        "user.email",
        "user.email_verified_at",
        "user.refreshTokens",
        "user.updated_at",
        "user.onboarding",
        "user.fullName",
        "user.language",
        "user.plan",
        "user.trial",
        "user.metadata",
      ])
      .where("otp.otpCode = :otpCode", { otpCode: verifyOTPInput.otp })
      .andWhere("user.email = :email", { email: verifyOTPInput.email.toLowerCase() }) // Convert email to lowercase
      .orderBy("otp.created_at", "DESC")
      .getOne();

    if (!otp) throw new BadRequestError("Invalid OTP");

    if (
      otp.isUsed === true ||
      isBefore(otp.created_at, thirtyMinutesAgo) ||
      (otp.purpose === "register" && otp.user.email_verified_at) ||
      (otp.purpose === "signin" && !otp.user.email_verified_at)
    )
      throw new BadRequestError("OTP has expired");

    if (!otp.user.email_verified_at) {
      // this is their first time logging in
      otp.user.email_verified_at = new Date();
    }

    const tokens = generateJWTPair({ id: otp.user.id });

    otp.user.refreshTokens.push(tokens.refreshToken);

    const { ...updatedOTP } = await OTPRepository.save({ ...otp, isUsed: true, user: otp.user });

    const { refreshTokens, ...user } = updatedOTP.user;

    await UserRepository.save(updatedOTP.user);

    return { user, token: tokens.token, refreshToken: tokens.refreshToken };
  } catch (error) {
    console.error("Error in verifyOTP", { error, body: verifyOTPInput }, "AuthService");

    throw error;
  }
}

async function resendOTP(resendOTPInput: AuthInput) {
  try {
    console.log("resendOTP called", { resendOTPInput }, "AuthService");

    const user = await UserRepository.findOne({
      where: {
        email: resendOTPInput.email.toLowerCase(),
      },
    });

    if (!user) throw new NotFoundError("No account with this email exists");

    const loginCode = generateOTP(6);

    await OTPRepository.save({
      otpCode: loginCode,
      user: user,
      purpose: user.email_verified_at ? "signin" : "register",
    });

    await sendLoginCode(user.email, loginCode, user.email_verified_at ? "login" : "registration");

    return { message: "OTP sent. Check your email." };
  } catch (error) {
    console.error("Error in resendOTP", { error, body: resendOTPInput }, "AuthService");

    throw error;
  }
}

async function refreshAccessToken({ refreshToken }: RefreshAccessTokenInput) {
  try {
    console.log("refreshAccessToken called", { refreshToken }, "AuthService");

    const payload = await verifyRefreshJWT(refreshToken);

    const user = await UserRepository.findOne({
      select: [
        "id",
        "email",
        "onboarding",
        "fullName",
        "language",
        "plan",
        "trial",
        "metadata",
        "refreshTokens",
        "email_verified_at",
      ],
      where: { id: payload.id },
    });

    if (!user) throw new BadRequestError("Invalid refresh token");

    const tokens = generateJWTPair({ id: user.id });

    user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
    user.refreshTokens.push(tokens.refreshToken);
    const { refreshTokens, ...updatedUser } = await UserRepository.save(user);

    return { user: updatedUser, token: tokens.token, refreshToken: tokens.refreshToken };
  } catch (error) {
    console.error("Error in refreshAccessToken", { error, refreshToken }, "AuthService");
    throw error;
  }
}

async function logout(id: number, refreshToken: string) {
  try {
    console.log("logout called", { id }, "AuthService");

    const user = await UserRepository.findOne({ select: ["id", "refreshTokens"], where: { id } });

    if (!user) throw new NotFoundError("User not found");

    user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);

    await UserRepository.save(user);

    return { message: "Logged out successfully" };
  } catch (error) {
    console.error("Error in logout", { error, id }, "AuthService");

    throw error;
  }
}

async function createUser(email: string, retry = 0) {
  try {
    console.log("createUser called", { email }, "AuthService");

    const newUser = await UserRepository.save({ email, email_verified_at: new Date() });

    return newUser;
  } catch (error) {
    console.error("Error in createUser", { error, email }, "AuthService");

    if (retry < 3) {
      return createUser(email, retry + 1);
    }

    throw error;
  }
}

export default { register, signin, verifyOTP, resendOTP, refreshAccessToken, logout, createUser };
