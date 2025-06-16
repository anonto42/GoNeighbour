import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getMultipleFilesPath, getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { PostService } from './post.service';

const createPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...userData } = req.body;
    const user = req.user;

    const images = getMultipleFilesPath(req.files,"image")

    // const modified_location = {
    //     inText: userData.location,
    //     geoJSON: {
    //         type: "Point",
    //         coordinates: [userData.lon, userData.lat]
    //     }
    // };
    // userData.location = modified_location;

    const data = {
        images,
        ...userData
    }

    const result = await PostService.createPost(user,data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully created the post',
      data: result,
    });
  }
);

export const PostController = { 
    createPost
};