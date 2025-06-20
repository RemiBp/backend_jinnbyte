import { NextFunction, Request, Response } from 'express';
import { AuthInputSchema } from '../../validators/app/auth.validation';
import { AdminAuthService } from '../../services/admin/auth.service';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedInput = AuthInputSchema.parse(req.body);

    const response = await AdminAuthService.login(validatedInput);

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export * as AuthController from './auth.controller';
