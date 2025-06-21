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
  body: z.object({
    name: z.string().optional(),
    user_name: z.string().optional(),
    contact: z.string().optional(),
    email: z.string().optional(),
    location: z.string().optional(),
    image: z.string().optional()
  })
});

const createReportRequestZodSchema = z.object({
  body: z.object({
    title: z.string({required_error: "You must give the title of this task!"}),
    description: z.string({required_error: "you must give the description of the report"}),
    image: z.any({required_error: "You must give the image of your problem!"})
  })
})

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
  createReportRequestZodSchema
};
