import { z } from 'zod';

const defaultZodSchema = z.object({
  body: z.object({
    amount: z.number({required_error: "You must give the amount"}),
    reason: z.string({required_error: "you must give the reson for your bid"}),
    postID: z.string({required_error: "You must give the id that you want to send the bid!"})
  }),
});

const intrigateBidZodSchema = z.object({
  body: z.object({
    action: z.boolean({required_error: "You must give the value"}),
    bid_id: z.string({required_error: "You must give the id that you want to integrate!"})
  }),
});

const payBidZodSchema = z.object({
  body: z.object({
    bid_id: z.string({required_error: "You must give the id that you want to pay!"})
  }),
});

const cancelBidZodSchema = z.object({
  body: z.object({
    bid_id: z.string({required_error: "You must give the id that you want to cancel!"})
  }),
});

export const BidValidation = {
  defaultZodSchema,
  intrigateBidZodSchema,
  payBidZodSchema,
  cancelBidZodSchema
};