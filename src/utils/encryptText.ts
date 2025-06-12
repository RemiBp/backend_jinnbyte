import dotenv from "dotenv";
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

dotenv.config();

export function encrypt(text: string): string {
  const secretKey = Buffer.from(process.env.ENCRYPTION_KEY!, "base64");
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", secretKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const secretKey = Buffer.from(process.env.ENCRYPTION_KEY!, "base64");
  const [ivHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = createDecipheriv("aes-256-cbc", secretKey, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// const testScript =
//   "b770e126cba93da90bc945df48b3e43c:74bf125f2820c6be243c855c5e872b433e94fdfb88874605cead58e1a45b0566cd99ac1042d30df166b6c861c7abe7b9";
// setTimeout(() => {
//   const str = decrypt(testScript);

//   console.log(str);

//   const strippedStr = str
//     .trim()
//     .replace(/^```markdown\s*\n/, "")
//     .replace(/```$/, "")
//     .trim();

//   console.log(encrypt(strippedStr));
// }, 1000);
