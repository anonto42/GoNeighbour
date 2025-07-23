import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ValidationService } from './validation.service';
import { getSingleFilePath } from '../../../shared/getFilePath';

const faceVerificationController = catchAsync(async (
  req: Request, 
  res: Response
) => {
  const FaceImage = getSingleFilePath(req.files,"FaceImage")
  const NIDImage = getSingleFilePath(req.files,"NIDImage")

  const { ...verifyData } = req.body;

  const data = {
    FaceImage,
    NIDImage,
    ...verifyData
  }

  const result = await ValidationService.faceVerificationService(data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Face verification successfully!",
    data: result,
  });
});

export const ValidationController = { faceVerificationController };
