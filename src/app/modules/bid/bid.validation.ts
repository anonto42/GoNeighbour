import { z } from 'zod';

const defaultZodSchema = z.object({
  body: z.object({
    amount: z.number({required_error: "You must give the amount"}),
    reason: z.string({required_error: "you must give the reson for your bid"}),
    to: z.string({required_error: "You must give the id that you want to send the bid!"})
}),
});


export const BidValidation = {
  defaultZodSchema,
};
