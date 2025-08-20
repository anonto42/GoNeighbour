import { Model, Types } from 'mongoose';

export type IChat = {
  name: string;
  participants: Types.ObjectId[];
};

export type ChatModel = {
  isArray(token: string): any;
} & Model<IChat>;