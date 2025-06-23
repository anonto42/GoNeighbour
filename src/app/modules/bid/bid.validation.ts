import { z } from 'zod';

const defaultZodSchema = z.object({
  body: z.object({
    somthing: z.string({ required_error: '' })
  }),
});


export const BidValidation = {
  defaultZodSchema,
};
