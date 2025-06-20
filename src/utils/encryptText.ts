import dotenv from 'dotenv';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

dotenv.config();

export function encrypt(text: string): string {
  const secretKey = Buffer.from(process.env.ENCRYPTION_KEY!, 'base64');
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', secretKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const secretKey = Buffer.from(process.env.ENCRYPTION_KEY!, 'base64');
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = createDecipheriv('aes-256-cbc', secretKey, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
