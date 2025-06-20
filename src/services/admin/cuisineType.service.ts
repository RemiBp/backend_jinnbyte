import { NotFoundError } from '../../errors/notFound.error';
import { CuisineTypeRepository } from '../../repositories';
import {
  CreateCuisineTypeSchema,
  getCuisineTypesSchema,
  UpdateCuisineTypeSchema,
} from '../../validators/admin/cuisineType.validation';

export const createCuisineType = async (cuisineTypeObject: CreateCuisineTypeSchema) => {
  try {
    const existingCuisineType = await CuisineTypeRepository.findOne({
      where: {
        name: cuisineTypeObject.name,
        isDeleted: false,
      },
    })
    if (existingCuisineType) {
      throw new NotFoundError('Cuisine Type already exists');
    }
    const cuisineType = await CuisineTypeRepository.save(cuisineTypeObject);
    return cuisineType;
  } catch (error) {
    throw error;
  }
};

export const getCuisineTypes = async (getCuisineTypeObject: getCuisineTypesSchema) => {
  try {
    const { page, limit, keyword } = getCuisineTypeObject;

    const queryBuilder = CuisineTypeRepository.createQueryBuilder('cuisineType').where(
      'cuisineType.isDeleted = :isDeleted',
      { isDeleted: false }
    );

    if (keyword) {
      queryBuilder.andWhere(`(cuisineType.name ILIKE :keyword)`, { keyword: `%${keyword}%` });
    }

    queryBuilder
      .orderBy('cuisineType.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [cuisineTypes, count] = await queryBuilder.getManyAndCount();

    return {
      cuisineTypes,
      count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  } catch (error) {
    throw error;
  }
};

export const getCuisineType = async (cuisineTypeId: number) => {
  try {
    const cuisineType = await CuisineTypeRepository.findOne({
      where: {
        id: cuisineTypeId,
        isDeleted: false,
      },
    });
    if (!cuisineType) {
      throw new NotFoundError('User Not found');
    }
    return {
      cuisineType,
    };
  } catch (error) {
    throw error;
  }
};

export const updateCuisineType = async (updateCuisineTypeObject: UpdateCuisineTypeSchema) => {
  try {
    const { cuisineTypeId, isActive, name, imageUrl } = updateCuisineTypeObject;
    const cuisineType = await CuisineTypeRepository.findOne({ where: { id: cuisineTypeId, isDeleted: false } });
    if (!cuisineType) {
      throw new NotFoundError('Cuisine Type Not found');
    }
    cuisineType.isActive = isActive ? isActive : cuisineType.isActive;
    cuisineType.name = name ? name : cuisineType.name;
    cuisineType.imageUrl = imageUrl ? imageUrl : cuisineType.imageUrl;
    const updatedCuisineType = await CuisineTypeRepository.save(cuisineType);
    return updatedCuisineType;
  } catch (error) {
    throw error;
  }
};

export const deleteCuisineType = async (cuisineTypeId: number) => {
  try {
    const cuisineType = await CuisineTypeRepository.findOne({ where: { id: cuisineTypeId } });
    if (!cuisineType) {
      throw new NotFoundError('Cuisine Type Not found');
    }
    cuisineType.isDeleted = true;
    cuisineType.isActive = false;
    const deletedCuisineType = await CuisineTypeRepository.save(cuisineType);
    return deletedCuisineType;
  } catch (error) {
    throw error;
  }
};

export * as AdminCuisineTypeService from './cuisineType.service';
