import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...userData } = req.body;
    const result = await UserService.createUserToDB(userData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User created successfully',
      data: result,
    });
  }
);

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let image = getSingleFilePath(req.files, 'image');

    const data = {
      image,
      ...req.body,
    };
    const result = await UserService.updateProfileToDB(user, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);

const searchData = catchAsync(async (req: Request, res: Response) => {
  
  const user = req.user;
  const {
    keyWord,
    limit,
    page
   } = req.body;

  const result = await UserService.searchData(user,keyWord,page,limit);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Successfully get the data with keyword!',
    data: result,
  });
});

const top10KeyWords = catchAsync(async (req: Request, res: Response) => {
  
  const limit = req.body.limit
  const result = await UserService.getTopSearchedKeywords(limit);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Successfully get keywords!',
    data: result,
  });
});

const homeData = catchAsync(async (req: Request, res: Response) => {
  
  const user = req.user;
  const { limit, page } = req.body;
  const result = await UserService.home_data(user, page, limit);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Successfully get home data!',
    data: result,
  });
});


export const UserController = { 
  createUser, getUserProfile, updateProfile,
  searchData, top10KeyWords, homeData
};
