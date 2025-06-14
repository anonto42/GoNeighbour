import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import { register } from '../../../types/user';

const createUserToDB = async (payload: Partial<register>): Promise<any> => {
  await User.isExistUserByEmail(payload.email!);

  const user = {
    name: payload.first_name + " " + payload.last_name,
    email: payload.email,
    password: payload.password,
    role: USER_ROLES.USER
  }

  const createUser = await User.create(user);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  };

  //send email
  const otp = generateOTP();
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 5 * 60000),
  };
  await User.findOneAndUpdate(
    { _id: createUser._id },
    { $set: { authentication } }
  );

  return {
    name: createUser.name,
    email: createUser.email,
    image: createUser.image,
  };
};

const getUserProfileFromDB = async (
  user: JwtPayload
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.isValidUser(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  };

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
) => {
  try {
    const { id } = user;
    const isExistUser = await User.isValidUser(id);
  
    //unlink file here
    if (payload.image) {
      unlinkFile(isExistUser.image);
    };
  
    const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
      new: true,
    }).select("-password -verified -authentication").lean().exec();
  
    unlinkFile(payload.image!)
    return updateDoc;
    
  } catch (error: any) {
    unlinkFile(payload.image as string)
    throw new ApiError(
      error.status,
      error.message
    )
  };
};

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
};
