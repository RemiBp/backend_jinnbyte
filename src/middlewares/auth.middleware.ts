import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface UserPayload extends JwtPayload {
  id: number;
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_ACCESS_SECRET!, (err, user) => {
      if (err || !user) {
        return res.sendStatus(401);
      }

      if (typeof user !== "string" && "id" in user) {
        const payload = user as UserPayload;

        req.user_id = payload.id;
        next();
      } else {
        res.sendStatus(401);
      }
    });
  } else {
    res.sendStatus(401);
  }
};
