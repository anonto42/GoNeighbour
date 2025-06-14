import { z } from 'zod';

const createUserZodSchema = z.object({
  body: z.object({
    first_name: z.string({ required_error: 'first name is required' }),
    last_name: z.string({ required_error: 'last name is required' }),
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' })
  }),
});

const updateUserZodSchema = z.object({
  name: z.string().optional(),
  contact: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  location: z.string().optional(),
  image: z.string().optional(),
});

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
};
