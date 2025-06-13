import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { BadRequestError } from "../errors/badRequest.error";

dotenv.config();

interface Payload {
  id: number;
}

export function generateJWT(payload: Payload, secret: string, expiresIn: any) {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
}

export function generateJWTPair(payload: Payload) {
  const token = generateJWT(payload, process.env.JWT_ACCESS_SECRET, process.env.JWT_ACCESS_EXPIRY);
  const refreshToken = generateJWT(payload, process.env.JWT_REFRESH_SECRET, process.env.JWT_REFRESH_EXPIRY);
  return { token, refreshToken };
}

export function verifyRefreshJWT(token: string) {
  if (!token) {
    throw new BadRequestError("Token is missing");
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not defined in environment variables");
  }

  try {
    if (typeof token !== "string" || token.trim() === "") {
      throw new BadRequestError("Invalid token format");
    }
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET) as Payload;
    return payload;
  } catch (error) {
    throw new BadRequestError("Invalid token: " + error);
  }
}

// console.log(generateJWTPair({ id: 1 }));
