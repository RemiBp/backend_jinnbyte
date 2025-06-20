import { FindOptionsWhere, ILike } from 'typeorm';
import { NotFoundError } from '../../errors/notFound.error';
import { UserRepository } from '../../repositories';
import { GetUsersSchema } from '../../validators/admin/user.validation';

export const getUsers = async (getUsersObject: GetUsersSchema) => {
  try {
    const { page, limit, keyword } = getUsersObject;
    const baseCondition = { isActive: true, role: { id: 2 } };

    let whereCondition: FindOptionsWhere<any> | FindOptionsWhere<any>[] = baseCondition;

    if (keyword) {
      const getOrConditions = (keyword: string): FindOptionsWhere<any>[] => {
        return [
          { ...baseCondition, firstName: ILike(`%${keyword}%`) },
          { ...baseCondition, lastName: ILike(`%${keyword}%`) },
          { ...baseCondition, email: ILike(`%${keyword}%`) },
          { ...baseCondition, phoneNumber: ILike(`%${keyword}%`) },
        ];
      };
      whereCondition = getOrConditions(keyword);
    }

    const [users, count] = await UserRepository.findAndCount({
      where: whereCondition,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const totalPages = Math.ceil(count / limit);

    return {
      users,
      count: count,
      page: page,
      limit: limit,
      totalPages: totalPages,
    };
  } catch (error) {
    throw error;
  }
};

export const getUser = async (userId: number) => {
  try {
    const user = await UserRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new NotFoundError('User Not found');
    }

    return {
      user,
    };
  } catch (error) {
    throw error;
  }
};

export const updateUserStatus = async (userId: number, isActive: boolean) => {
  try {
    const user = await UserRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new NotFoundError('User not found.');
    }
    user.isActive = isActive;
    await UserRepository.save(user);
    return {
      message: 'User status updated successfully',
    };
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (userId: number) => {
  try {
    const user = await UserRepository.findOne({
      where: { id: userId },
      relations: ['Password'],
    });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const userPassword = user.Password.password;
    if (!userPassword) {
      throw new NotFoundError('User password not found');
    }

    const today = new Date();

    const email = user.email;
    const uniqueSuffix = `+deleted_${Date.now()}`;
    user.email = email.split('@')[0] + uniqueSuffix + '@' + email.split('@')[1];
    user.name = 'deleted+' + user.name;
    user.isActive = false;
    user.isDeleted = true;
    user.profileImage = '';
    user.password = '';

    await UserRepository.save(user);

    return { message: 'Account deleted successfully' };
  } catch (error) {
    throw error;
  }
};

export * as AdminUserService from './user.service';
