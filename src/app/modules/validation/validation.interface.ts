import { Model, Types } from 'mongoose';

export type IValidation = {

};

export type ResetTokenModel = {
  isArray(token: string): any;
} & Model<IValidation>;
