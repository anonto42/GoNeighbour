import { z } from 'zod';

const createAbouUsZodSchema = z.object({
  body: z.object({
    data: z.string({ required_error: 'You must give the data to create the about us' })
  }),
});

const createUpdateAbouUsZodSchema = z.object({
  body: z.object({
    data: z.string({ required_error: 'You must give the data to update the about us' })
  }),
});


const updateUserZodSchema = z.object({
  name: z.string().optional(),
  user_name: z.string().optional(),
  contact: z.string().optional(),
  email: z.string().optional(),
  location: z.string().optional(),
  image: z.string().optional(),
});

export const AdminValidation = {
  createAbouUsZodSchema,
  createUpdateAbouUsZodSchema,
  updateUserZodSchema,
};
