import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { AdminServices } from './admin.service';

const PostAboutUs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...aboutUsData } = req.body;
    const user = req.user;
    const result = await AdminServices.create_about_us(user,aboutUsData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully created the about us data!',
      data: result,
    });
  }
);

const GetAboutUsData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const result = await AdminServices.get_about_us(user);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully get the about us data!',
      data: result,
    });
  }
);

const UpdateAboutUsData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const {...data} = req.body;
    const result = await AdminServices.update_about_us(user,data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully update the about us data!',
      data: result,
    });
  }
);


export const AdminController = { 
    PostAboutUs,GetAboutUsData,UpdateAboutUsData,

};