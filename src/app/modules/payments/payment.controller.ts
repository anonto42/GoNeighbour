import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";


const CreateFAQData = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = req.user;
      const { ...data } = req.body;
      const result = "";
    //   const result = await AdminServices.create_faq(user,data);
  
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Successfully created the faq data!',
        data: result,
      });
    }
  );

export const PaymentController = {
    CreateFAQData
};
    