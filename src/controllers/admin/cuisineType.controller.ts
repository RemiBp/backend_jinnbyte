import { NextFunction, Request, Response } from 'express';
import { AdminCuisineTypeService } from '../../services/admin/cuisineType.service';
import { getRestaurantsSchema, updateAccountStatusSchema } from '../../validators/admin/restaurant.validation';
import {
  createCuisineTypeSchema,
  getCuisineTypesSchema,
  updateCuisineTypeSchema,
} from '../../validators/admin/cuisineType.validation';

export const createCuisineType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cuisineTypeObject = req.body;
    const validatedObject = createCuisineTypeSchema.parse(cuisineTypeObject);
    const response = await AdminCuisineTypeService.createCuisineType(validatedObject);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getCuisineTypes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const keyword = req.query.keyword ? String(req.query.keyword) : undefined;
    const validatedObject = getCuisineTypesSchema.parse({
      page,
      limit,
      keyword,
    });
    const response = await AdminCuisineTypeService.getCuisineTypes(validatedObject);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getCuisineType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cuisineTypeId = Number(req.params.id);
    if (!cuisineTypeId) {
      throw new Error('cuisineTypeId is required');
    }
    const response = await AdminCuisineTypeService.getCuisineType(cuisineTypeId);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateCuisineType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cuisineTypeId = Number(req.params.id);
    const isActive = req.body.isActive;
    const name = req.body.name ? String(req.body.name) : undefined;
    const imageUrl = req.body.imageUrl ? String(req.body.imageUrl) : undefined;
    const validatedObject = updateCuisineTypeSchema.parse({
      cuisineTypeId,
      isActive,
      name,
      imageUrl,
    });
    const response = await AdminCuisineTypeService.updateCuisineType(validatedObject);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteCuisineType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cuisineTypeId = Number(req.params.id);
    if (!cuisineTypeId) {
      throw new Error('cuisineTypeId is required');
    }
    const response = await AdminCuisineTypeService.deleteCuisineType(cuisineTypeId);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export * as AdminCuisineTypeController from './cuisineType.controller';
