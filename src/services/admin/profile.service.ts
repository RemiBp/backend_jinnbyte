import { HelpAndSupportRepository, RestaurantRepository, UserRepository } from '../../repositories';
import s3Service from '../s3.service';
import { NotFoundError } from '../../errors/notFound.error';
import {
  PreSignedURL,
  UpdateHelpAndSupportSchema,
  UpdateProfileSchema,
  UploadDocuments,
} from '../../validators/admin/profile.validation';

export const updateProfile = async (userId: number, updateProfileObject: UpdateProfileSchema) => {
  try {
    const { firstName, lastName, phoneNumber, profilePicture } = updateProfileObject;
    const user = await UserRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const checkPhoneNumber = await UserRepository.findOne({
      where: {
        phoneNumber: phoneNumber,
      },
    });
    if (checkPhoneNumber) {
      throw new NotFoundError('Phone number already exist');
    }
    user.firstName = firstName;
    user.lastName = lastName;
    user.phoneNumber = phoneNumber;
    user.profilePicture = profilePicture;

    const updateUser = await UserRepository.save(user);

    return { message: 'Profile Updated successfully' };
  } catch (error) {
    console.error('Error in updateProfile', { error });
    throw error;
  }
};

export const getProfile = async (userId: number) => {
  try {
    const user = await UserRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return { user: user };
  } catch (error) {
    console.error('Error in getProfile', { error });
    throw error;
  }
};

export const getPreSignedUrl = async (userId: number, getPreSignedURLObject: PreSignedURL) => {
  try {
    const { fileName, contentType, folderName } = getPreSignedURLObject;
    const user = await UserRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const { url, keyName } = await s3Service.getPresignedUploadUrl(fileName, contentType, true, folderName);
    return { url, keyName };
  } catch (error) {
    throw error;
  }
};

export const getViewUrl = async (userId: number, key: string) => {
  try {
    const user = await UserRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const { url } = await s3Service.getViewUrl(key);
    return { url };
  } catch (error) {
    throw error;
  }
};

export const uploadDocuments = async (uploadDocumentsObject: UploadDocuments) => {
  try {
    const { userId, certificateOfHospitality, certificateOfTourism } = uploadDocumentsObject;
    const restaurant = await RestaurantRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }
    restaurant.certificateOfHospitality = certificateOfHospitality;
    restaurant.certificateOfTourism = certificateOfTourism;
    restaurant.accountStatus = 'underReview';
    await RestaurantRepository.save(restaurant);

    return { message: 'Documents uploaded successfully' };
  } catch (error) {
    throw error;
  }
};

export const getHelpAndSupport = async (userId: number) => {
  try {
    const helpAndSupport = await HelpAndSupportRepository.findOne({ where: { id: 1 } });
    if (!helpAndSupport) {
      throw new NotFoundError('Help and support not found');
    }
    return { helpAndSupport: helpAndSupport };
  } catch (error) {
    console.error('Error in getProfile', { error });
    throw error;
  }
};

export const updateHelpAndSupport = async (userId: number, updateHelpAndSupportObject: UpdateHelpAndSupportSchema) => {
  try {
    const { emailForCustomers, phoneForCustomers, emailForRestaurants, phoneForRestaurants } =
      updateHelpAndSupportObject;
    const helpAndSupports = await HelpAndSupportRepository.findOne({ where: { id: 1 } });
    if (!helpAndSupports) {
      throw new NotFoundError('Help and support not found');
    }
    helpAndSupports.emailForCustomers = emailForCustomers ? emailForCustomers : helpAndSupports.emailForCustomers;
    helpAndSupports.phoneForCustomers = phoneForCustomers ? phoneForCustomers : helpAndSupports.phoneForCustomers;
    helpAndSupports.emailForRestaurants = emailForRestaurants
      ? emailForRestaurants
      : helpAndSupports.emailForRestaurants;
    helpAndSupports.phoneForRestaurants = phoneForRestaurants
      ? phoneForRestaurants
      : helpAndSupports.phoneForRestaurants;
    const updateHelpAndSupport = await HelpAndSupportRepository.save(helpAndSupports);

    return { message: 'Help and support Updated successfully' };
  } catch (error) {
    console.error('Error in updateProfile', { error });
    throw error;
  }
};

export * as ProfileService from './profile.service';
