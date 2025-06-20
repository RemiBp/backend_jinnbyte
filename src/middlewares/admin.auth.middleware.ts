import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface UserPayload extends JwtPayload {
  id: number;
}

export const authenticateJWTForAdmin = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers.authorization?.split(' ')[1];

  if (accessToken) {
    jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET!, (err, user) => {
      if (err || !user) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      if (typeof user !== 'string' && 'id' in user) {
        const payload = user as UserPayload;
        if (payload.role.id !== 1) {
          return res.sendStatus(401).json({ message: 'User is not an admin' });
        }

        req.userId = payload.id;
        next();
      } else {
        res.status(401).json({ message: 'Invalid token' });
      }
    });
  } else {
    res.status(401).json({ message: 'token is missing in header' });
  }
};
