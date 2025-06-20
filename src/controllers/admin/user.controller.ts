import { NextFunction, Request, Response } from 'express';
import { AdminUserService } from '../../services/admin/user.service';
import { getUsersSchema } from '../../validators/admin/user.validation';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = String(req.query.status) || 'all';
    const keyword = req.query.keyword;
    const validatedObject = getUsersSchema.parse({
      page,
      limit,
      keyword,
    });
    const response = await AdminUserService.getUsers(validatedObject);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.params.id);
    if (!userId) {
      throw new Error('UserId is required');
    }
    const response = await AdminUserService.getUser(userId);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.params.id);
    const isActive = req.body.isActive;
    const response = await AdminUserService.updateUserStatus(userId, isActive);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.params.id);
    if (!userId) {
      throw new Error('User id is required');
    }
    const response = await AdminUserService.deleteUser(userId);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export * as UserController from './user.controller';
