import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import ms from 'ms';
import { BadRequestError } from '../errors/badRequest.error';

dotenv.config();

interface Payload {
  id: number;
}

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const JWT_ACCESS_EXPIRY: string = process.env.JWT_ACCESS_EXPIRY || '1d';
const JWT_REFRESH_EXPIRY: string = process.env.JWT_REFRESH_EXPIRY || '7d';

const accessExpiryInMs = ms(JWT_ACCESS_EXPIRY as ms.StringValue);
if (isNaN(accessExpiryInMs)) {
  throw new Error('Invalid JWT Access Expiry value');
}

const refreshExpiryInMs = ms(JWT_REFRESH_EXPIRY as ms.StringValue);
if (isNaN(refreshExpiryInMs)) {
  throw new Error('Invalid JWT Refresh Expiry value');
}

export function generateJWT(payload: Payload, secret: string, expiresIn: number) {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
}

export function generateJWTPair(payload: Payload) {
  const token = generateJWT(payload, JWT_ACCESS_SECRET, accessExpiryInMs);
  const refreshToken = generateJWT(payload, JWT_REFRESH_SECRET, refreshExpiryInMs);
  return { token, refreshToken };
}

export function verifyRefreshJWT(token: string) {
  const payload = jwt.verify(token, JWT_REFRESH_SECRET) as Payload;

  if (!payload) throw new BadRequestError('Invalid token');

  return payload;
}
