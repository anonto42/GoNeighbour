import { z } from "zod";

const createDepositZodSchema = z.object({
    body: z.object({
        amount: z.number({ required_error: "You must give the amount" })
    })
})

const createPayment = z.object({
    
})

const updatePayment = z.object({
    
})

export const PaymentValidation = {
    createDepositZodSchema
};