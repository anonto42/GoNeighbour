import { Model, Types } from 'mongoose';
import { STATUS, USER_ROLES } from '../../../enums/user';

export type IUser = {
  name: string;
  user_name: string;
  role: USER_ROLES;
  contact: string;
  email: string;
  faceVerifyed: boolean;
  password: string;
  location: string;
  image?: string;
  status: STATUS;
  verified: boolean;
  favorites: Types.ObjectId[];
  searchKeywords: string[];
  reviews: [
    {
      star: number,
      comment: string,
      from: string
    }
  ];
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
};

export type UserModal = {
  isValidUser(id: string):any;
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
