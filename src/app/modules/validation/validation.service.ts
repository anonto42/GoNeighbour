import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import unlinkFile from '../../../shared/unlinkFile';
import { JwtPayload } from 'jsonwebtoken';
import { imageData } from './validation.interface';
import { User } from '../user/user.model';
import fs from 'fs';
import axios from 'axios';
import config from '../../../config';
import path from 'path';
import { CognitiveServicesCredentials } from '@azure/ms-rest-azure-js';
import { FaceClient } from '@azure/cognitiveservices-face';

const credentials = new CognitiveServicesCredentials(config.azure.key as string); 
const client = new FaceClient(credentials, config.azure.endpoint as string);

// const faceVerificationService = async (
//   payload: JwtPayload,
//   data: imageData
// ) => {
//   try {
//     await User.isValidUser(payload.id);
    
//     const currentDir = process.cwd();
//     const filePth1 = path.join(currentDir, "uploads", data.FaceImage);
//     const absolutePath1 = path.resolve(filePth1);
//     const faceImage = fs.readFileSync(absolutePath1); 

//     const filePth2 = path.join(currentDir, "uploads", data.NIDImage);
//     const absolutePath2 = path.resolve(filePth2);
//     const nidImage = fs.readFileSync(absolutePath2); 

//     const faceIDdata = await axios.post(`${config.azure.endpoint}/face/v1.0/detect`, faceImage, {
//       headers: {
//         'Ocp-Apim-Subscription-Key': config.azure.key,
//         'Content-Type': 'application/octet-stream', 
//         'Accept': 'application/json',
//         'User-Agent': 'axios/1.10.0',
//       },
//     });

//     const nidIDdata = await axios.post(`${config.azure.endpoint}/face/v1.0/detect`, nidImage, {
//       headers: {
//         'Ocp-Apim-Subscription-Key': config.azure.key,
//         'Content-Type': 'application/octet-stream', 
//         'Accept': 'application/json',
//         'User-Agent': 'axios/1.10.0',
//       },
//     });

//     console.log(faceIDdata.data)
//     console.log(nidIDdata.data)

//     return {
//       faceIDdata: faceIDdata.data,
//       nidIDdata: nidIDdata.data
//     }
    
//   } catch (error: any) {
//     unlinkFile(data.FaceImage);
//     console.log(error);
//     throw new ApiError(
//       StatusCodes.INTERNAL_SERVER_ERROR,
//       error.message
//     );
//   }
// };



// const faceVerificationService = async (
//   payload: JwtPayload,
//   data: imageData
// ) => {
//   try {
//     await User.isValidUser(payload.id);
    
//     const currentDir = process.cwd();
//     const filePth1 = path.join(currentDir, "uploads", data.FaceImage);
//     const absolutePath1 = path.resolve(filePth1);
//     const faceImage = fs.readFileSync(absolutePath1); 

//     const filePth2 = path.join(currentDir, "uploads", data.NIDImage);
//     const absolutePath2 = path.resolve(filePth2);
//     const nidImage = fs.readFileSync(absolutePath2); 

//     const faceIDdata = await axios.post(`${config.azure.endpoint}/face/v1.0/detect`, faceImage, {
//       headers: {
//         'Ocp-Apim-Subscription-Key': config.azure.key,
//         'Content-Type': 'application/octet-stream', 
//         'Accept': 'application/json',
//         'User-Agent': 'axios/1.10.0',
//       },
//     });

//     const nidIDdata = await axios.post(`${config.azure.endpoint}/face/v1.0/detect`, nidImage, {
//       headers: {
//         'Ocp-Apim-Subscription-Key': config.azure.key,
//         'Content-Type': 'application/octet-stream', 
//         'Accept': 'application/json',
//         'User-Agent': 'axios/1.10.0',
//       },
//     });

//     const faceId = faceIDdata.data[0]?.faceId;
//     const nidFaceId = nidIDdata.data[0]?.faceId;

//     console.log(faceIDdata.data, nidIDdata.data)

//     if (!faceId || !nidFaceId) throw new ApiError(StatusCodes.BAD_REQUEST, 'Face detection failed for one or both images.')

//     const verificationData = await axios.post(`${config.azure.endpoint}/face/v1.0/verify`, {
//       faceId1: faceId,
//       faceId2: nidFaceId
//     }, {
//       headers: {
//         'Ocp-Apim-Subscription-Key': config.azure.key,
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//         'User-Agent': 'axios/1.10.0',
//       },
//     });

//     const isIdentical = verificationData.data.isIdentical;
    
//     console.log("Verification result:", isIdentical ? "Faces match" : "Faces do not match");

//     return {
//       faceIDdata: faceIDdata.data,
//       nidIDdata: nidIDdata.data,
//       isIdentical: isIdentical
//     };
    
//   } catch (error: any) {
//     unlinkFile(data.FaceImage); 
//     unlinkFile(data.NIDImage);
//     console.log(error);
//     throw new ApiError(
//       StatusCodes.INTERNAL_SERVER_ERROR,
//       error.message
//     );
//   }
// };


const faceVerificationService = async (
  paylaod: JwtPayload,
  data: imageData
) => {
  try {

    const currentDir = process.cwd();
    const filePth1 = path.join(currentDir, "uploads", data.FaceImage);
    const absolutePath1 = path.resolve(filePth1);
    const faceImage = fs.readFileSync(absolutePath1); 

    const filePth2 = path.join(currentDir, "uploads", data.NIDImage);
    const absolutePath2 = path.resolve(filePth2);
    const nidImage = fs.readFileSync(absolutePath2); 

    const face1 = await client.face.detectWithStream(faceImage);
    const face2 = await client.face.detectWithStream(nidImage);

    const faceId1 = face1[0].faceId;
    const faceId2 = face2[0].faceId;

    if (!faceId1 || !faceId2) throw new ApiError(StatusCodes.BAD_REQUEST, 'Face detection failed for one or both images.')

    const verificationData = await client.face.verifyFaceToFace(faceId1, faceId2);

    return verificationData;

    
  } catch (error: any) {
    console.log(error)
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}



export const ValidationService = {
  faceVerificationService,
};
