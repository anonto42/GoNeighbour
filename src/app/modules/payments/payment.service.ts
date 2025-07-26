import { JwtPayload } from 'jsonwebtoken';
import Stripe from 'stripe';
import { User } from '../user/user.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

const createConnectionAccount = async (payload: JwtPayload,protocol:string,host:string) => {

    const objID = new Types.ObjectId(payload.id);
    const user = await User.findById(objID);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User was not found!");
    }
  
    if (user.paymentValidation.accountCreated && user.paymentValidation.accountID) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "User already has a connection account!");
    }
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: user.email,
      business_type: 'individual',
      individual: {
        first_name: user.name.split(' ')[0],
        last_name: user.name.split(' ')[1] || '',
        email: user.email,
        phone: user.contact || '0000000000',
        // dob: { year: user.dobYear, month: user.dobMonth, day: user.dobDay },
      },
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
      metadata: {
        user_id: user._id.toString(),
      },
    });

    await user.updateOne({
      $set: {
        "paymentValidation.accountID": account.id,
      },
    });
  
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${protocol}://${host}/api/v1/payment/refresh/${account.id}`,
      return_url: `${protocol}://${host}/api/v1/payment/success/${account.id}`,
      type: 'account_onboarding',
    });
  
    return {
      onboardingUrl: accountLink.url,
    };
};
  
const createCheckoutSession = async (
//   amount: number,
//   currency: string,
//   successUrl: string,
//   cancelUrl: string

    payload: JwtPayload,
    bidID: string
) => {
//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ['card'],
//     mode: 'payment', // one-time payment
//     line_items: [
//       {
//         price_data: {
//           currency: "usd",
//           product_data: {
//             name: 'Sample Product or Service',
//           },
//           unit_amount: amount, // in cents
//         },
//         quantity: 1,
//       },
//     ],
//     success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
//     cancel_url: cancelUrl,
//   });

//   return {
//     checkoutUrl: session.url,
//   };
};

const transferToConnectedAccount = async (
    amount: number,
    currency: string,
    connectedAccountId: string
  ) => {
    const transfer = await stripe.transfers.create({
      amount,
      currency,
      destination: connectedAccountId,
    });
  
    return transfer;
};
  



export const PaymentService = {
    createConnectionAccount,
    createCheckoutSession,
    transferToConnectedAccount
};
