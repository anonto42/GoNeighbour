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

const bidRequestes = catchAsync(async (
  req: Request, 
  res: Response
) => {
  const user = req.user
  const { ...data } = req.body;
  const result = await BidService.bidRequests(user,data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Bid requestes",
    data: result,
  });
});

const bidRequestesAsAdvengrar = catchAsync(async (
  req: Request, 
  res: Response
) => {
  const user = req.user
  const { ...data } = req.body;
  const result = await BidService.bidRequesteAsAdvengerer(user,data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Bid requestes",
    data: result,
  });
});

const intrigateWithBid = catchAsync(async (
  req: Request, 
  res: Response
) => {
  const user = req.user;
  const { action, bid_id } = req.body;
  const result = await BidService.intrigateWithBid(user,bid_id,action);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Re Bid sended!",
    data: result,
  });
});

export const BidController = {
  sendBid,
  bidRequestes,
  intrigateWithBid,
  bidRequestesAsAdvengrar
};
