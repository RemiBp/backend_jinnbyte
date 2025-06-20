import { AuthInput } from '../../validators/app/auth.validation';
import { RolesRepository, UserRepository } from '../../repositories';
import { BadRequestError } from '../../errors/badRequest.error';
import { NotFoundError } from '../../errors/notFound.error';

import { comparePassword } from '../../utils/comparePassword';
import { generateAccessToken, generateRefreshToken } from '../../utils/tokenUtils';

export const login = async (signinInput: AuthInput) => {
  try {
    const { email, password, deviceId } = signinInput;

    const user = await UserRepository.findOne({
      where: {
        email: email.toLowerCase(),
      },
      relations: ['role', 'Password'],
    });
    if (!user) throw new NotFoundError('No account with this email exists');
    const userRole = await RolesRepository.findOne({
      where: {
        name: 'admin',
      },
    });
    if (!userRole) {
      throw new BadRequestError('user role not found');
    }
    if (user.role.id != userRole.id) {
      throw new BadRequestError('user is not an admin');
    }

    const isPasswordMatch = await comparePassword(password, user.Password.password);
    if (!isPasswordMatch) {
      throw new BadRequestError('Invalid password');
    }
    user.deviceId = deviceId;
    await UserRepository.save(user);
    const accessToken = generateAccessToken(user.id, user.role, user.isActive);
    const refreshToken = generateRefreshToken(user.id, user.role, user.isActive);
    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      phoneNumber: user.phoneNumber,
      address: user.address,
      deviceId: user.deviceId,
      isActive: user.isActive,
      role: user.role,
    };

    return {
      user: userResponse,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw error;
  }
};

export * as AdminAuthService from './auth.service';
