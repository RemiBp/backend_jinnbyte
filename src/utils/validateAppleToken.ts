import axios from 'axios';
import jwt, { Algorithm, JwtHeader, JwtPayload } from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';

interface AppleKey {
  kty: 'RSA';
  kid: string;
  use: string;
  alg: string;
  n: string;
  e: string;
}

interface AppleKeys {
  [key: string]: AppleKey;
}

async function downloadApplePublicKeys(): Promise<AppleKeys> {
  try {
    const response = await axios.get<{ keys: AppleKey[] }>('https://appleid.apple.com/auth/keys');
    const keys: AppleKeys = {};

    response.data.keys.forEach(key => {
      keys[key.kid] = key;
    });

    return keys;
  } catch (error) {
    return {};
  }
}

export async function validateAppleToken(idToken: string): Promise<{ email: string; name: string; id: string } | null> {
  try {
    const decodedToken = jwt.decode(idToken, { complete: true }) as {
      header: JwtHeader;
      payload: JwtPayload;
    };
    const kid = decodedToken?.header?.kid;

    if (!kid) {
      throw new Error("Missing 'kid' in ID token header");
    }

    const keys = await downloadApplePublicKeys();
    const appleKey = keys[kid];

    if (!appleKey) {
      throw new Error("Apple public key not found for the given 'kid'");
    }

    const applePublicKey = jwkToPem(appleKey);
    const appleClientId = process.env.APPLE_CLIENT_ID;

    const validationParameters = {
      issuer: 'https://appleid.apple.com',
      audience: appleClientId,
      algorithms: ['RS256'] as Algorithm[],
    };

    const decoded = jwt.verify(idToken, applePublicKey, validationParameters) as JwtPayload;

    const email = decoded.email || '';
    const name = decoded.name || '';
    const appleUserId = decoded.sub || '';

    return {
      email,
      name,
      id: appleUserId,
    };
  } catch (error) {
    return null;
  }
}
