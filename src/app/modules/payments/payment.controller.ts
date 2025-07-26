import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { PaymentService, stripe } from "./payment.service";
import { renderPaymentSuccessPage } from "../../../shared/templates";
import { User } from "../user/user.model";

const createConnectionAccount = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = req.user;

      const host = req.headers?.host as string;
      const protocol = req.protocol;
      
      const result = await PaymentService.createConnectionAccount(user,protocol,host);
  
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Successfully created the connection account!',
        data: result,
      });
    }
);

const successPageAccount = catchAsync(async (
    req: Request, res: Response, next: NextFunction
) => {
    
    const { id } = req.params;
    const account = await stripe.accounts.update(id, {});
   
    if (
      account?.requirements?.disabled_reason &&
      account?.requirements?.disabled_reason.indexOf('rejected') > -1
    ) {
      return res.redirect(
        `${req.protocol + '://' + req.get('host')}/api/v1/payment/refresh/${id}`,
      );
    }
    if (
      account?.requirements?.disabled_reason &&
      account?.requirements?.currently_due &&
      account?.requirements?.currently_due?.length > 0
    ) {
      return res.redirect(
        `${req.protocol + '://' + req.get('host')}/api/v1/payment/refresh/${id}`,
      );
    }
    if (!account.payouts_enabled) {
      return res.redirect(
        `${req.protocol + '://' + req.get('host')}/api/v1/payment/refresh/${id}`,
      );
    }
    if (!account.charges_enabled) {
      return res.redirect(
        `${req.protocol + '://' + req.get('host')}/api/v1/payment/refresh/${id}`,
      );
    }
    if (account?.requirements?.past_due) {
        return res.redirect(`${req.protocol + '://' + req.get('host')}/api/v1/payment/refresh/${id}`);
    }
    if (
      account?.requirements?.pending_verification &&
      account?.requirements?.pending_verification?.length > 0
    ) {
      return res.redirect(`${req.protocol + '://' + req.get('host')}/api/v1/payment/refresh/${id}`);
    }
    
    const user = await User.findOneAndUpdate({"paymentValidation.accountID": id},{
        "paymentValidation.accountCreated": true
    },{
        new: true
    })

    if (!user) {
        res.status(StatusCodes.NOT_FOUND).send("User was not founded!")
        return;
    }

    return res.send(renderPaymentSuccessPage(user.name,user.email))
});

const refreshAccount = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      
        const { id } = req.params;
        const host = req.headers?.host as string;
        const protocol = req.protocol;
        
        const onboardingLink = await stripe.accountLinks.create({
          account: id,
          refresh_url: `${protocol}://${host}/api/v1/payment/refresh/${id}`,
          return_url: `${protocol}://${host}/api/v1/payment/success/${id}`,
          type: 'account_onboarding',
        });
        
        return res.redirect(onboardingLink.url);
    }
);

const createCheckoutSession = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = req.user;
      const { ...data } = req.body;
      const result = await PaymentService.createCheckoutSession(user,data);
  
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Successfully payed!',
        data: result,
      });
    }
);

export const PaymentController = {
    createCheckoutSession,
    createConnectionAccount,
    successPageAccount,
    refreshAccount
};
    