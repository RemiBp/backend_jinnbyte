import * as jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import ms from 'ms';

config();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const JWT_ACCESS_EXPIRY: string = process.env.JWT_ACCESS_EXPIRY || '1d';
const JWT_REFRESH_EXPIRY: string = process.env.JWT_REFRESH_EXPIRY || '7d';

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET || !JWT_ACCESS_EXPIRY || !JWT_REFRESH_EXPIRY) {
  throw new Error('JWT environment variables are not properly set');
}

const accessExpiryInMs: number = ms(JWT_ACCESS_EXPIRY as ms.StringValue);
if (isNaN(accessExpiryInMs)) {
  throw new Error('Invalid JWT Access Expiry value');
}

const refreshExpiryInMs: number = ms(JWT_REFRESH_EXPIRY as ms.StringValue);
if (isNaN(refreshExpiryInMs)) {
  throw new Error('Invalid JWT Refresh Expiry value');
}

export const generateAccessToken = (id: number, role: string, status: boolean) => {
  const options: jwt.SignOptions = {
    expiresIn: accessExpiryInMs,
  };
  return jwt.sign({ id, role, status }, JWT_ACCESS_SECRET, options);
};

export const generateRefreshToken = (id: number, role: string, status: boolean) => {
  const options: jwt.SignOptions = {
    expiresIn: refreshExpiryInMs,
  };
  return jwt.sign({ id, role, status }, JWT_REFRESH_SECRET, options);
};
