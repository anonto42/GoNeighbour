import { Model, Types } from 'mongoose';

export type IChat = {
  name: string;
  participants: string[];
};

export type ChatModel = {
  isArray(token: string): any;
} & Model<IChat>;