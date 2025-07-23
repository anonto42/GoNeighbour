import { z } from 'zod';

const FaceValidationZodSchema = z.object({
  body: z.object({
    FaceImage: z.any({ required_error: 'FaceImage is required' }),
    NIDImage: z.any({ required_error: 'NIDImage is required' }),
    userID: z.string({ required_error: 'UserID is required' }),
  }),
});


export const ValidationValidation = {
  FaceValidationZodSchema,
};
