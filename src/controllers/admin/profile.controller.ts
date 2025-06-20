import { NextFunction, Request, Response } from 'express';
import {
  presignedURLSchema,
  updateHelpAndSupportSchema,
  updateProfileSchema,
  uploadDocumentsSchema,
} from '../../validators/admin/profile.validation';
import { ProfileService } from '../../services/admin/profile.service';

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new Error('userId is required');
    }
    const validatedObject = updateProfileSchema.parse(req.body);
    const response = await ProfileService.updateProfile(userId, validatedObject);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new Error('userId is required');
    }
    const response = await ProfileService.getProfile(userId);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getPreSignedUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const fileName = req.body.fileName;
    const contentType = req.body.contentType;
    const folderName = req.body.folderName;
    if (!userId) {
      throw new Error('userId is required');
    }
    const validatedObject = presignedURLSchema.parse({
      fileName,
      contentType,
      folderName,
    });
    const response = await ProfileService.getPreSignedUrl(userId, validatedObject);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getViewUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const key = req.body.key ? req.body.key : '';
    if (!userId) {
      throw new Error('userId is required');
    }
    if (!key || key === '') {
      throw new Error('key is required');
    }
    const response = await ProfileService.getViewUrl(userId, key);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const uploadDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = req.userId;
    const userId = Number(req.params.id);
    const certificateOfHospitality = req.body.certificateOfHospitality;
    const certificateOfTourism = req.body.certificateOfTourism;
    if (!userId) {
      throw new Error('User id is required');
    }
    const validatedObject = uploadDocumentsSchema.parse({
      userId,
      certificateOfHospitality: certificateOfHospitality,
      certificateOfTourism: certificateOfTourism,
    });
    const response = await ProfileService.uploadDocuments(validatedObject);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getHelpAndSupport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.userId);
    const response = await ProfileService.getHelpAndSupport(userId);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateHelpAndSupport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedObject = updateHelpAndSupportSchema.parse(req.body);
    const userId = Number(req.userId);
    const response = await ProfileService.updateHelpAndSupport(userId, validatedObject);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export * as ProfileController from './profile.controller';
