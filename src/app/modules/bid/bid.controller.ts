import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { BidService } from './bid.service';

const sendBid = catchAsync(async (
  req: Request, 
  res: Response
) => {
  const user = req.user
  const { ...verifyData } = req.body;
  const result = await BidService.sendBid(user,verifyData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Bid send successfully!",
    data: result,
  });
});

export const BidController = { 
  sendBid,
};
