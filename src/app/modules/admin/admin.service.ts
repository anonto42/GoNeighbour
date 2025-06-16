import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { register } from '../../../types/user';
import { about_us } from '../../../types/admin';
import { User } from '../user/user.model';
import { Policie } from '../policies/policie.model';
import { policie_type } from '../../../enums/policie';

const create_about_us = async (
    // payload: Partial<register>
    payload: JwtPayload,
    data : about_us
): Promise<any> => {
    
    await User.isValidUser(payload.id)
    
    const isAboutUsExist = await Policie.findOne({type: policie_type.ABOUT_US});
    if (isAboutUsExist) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "Already another about us data was exist you must delete the older one to create a new one or you can update the older one!"
        )
    };

    const newPoliciData = await Policie.create({
        context: data.data,
        type: policie_type.ABOUT_US
    });

    return newPoliciData;
};

const get_about_us = async (
    payload: JwtPayload,
): Promise<any> => {
    
    await User.isValidUser(payload.id)
    
    const isAboutUsExist = await Policie.findOne({type: policie_type.ABOUT_US});
    if (!isAboutUsExist) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "Your about us data was not exist!"
        )
    };

    return isAboutUsExist;
};

const update_about_us = async (
    payload: JwtPayload,
    data : about_us
): Promise<any> => {
    
    await User.isValidUser(payload.id)
    
    const isAboutUsExist = await Policie.findOne({type: policie_type.ABOUT_US});
    if (!isAboutUsExist) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "About us data was not exist at first you must create the about us data to update the data !"
        )
    };

    const newPoliciData = await Policie.findOneAndUpdate(
        {
            type: policie_type.ABOUT_US
        },
        {
            data: data.data
        },
        { 
            new: true
        }
    );

    return newPoliciData;
};

const get_condition_data = async (
    payload: JwtPayload,
): Promise<any> => {
    
    await User.isValidUser(payload.id)
    
    const isAboutUsExist = await Policie.findOne({type: policie_type.TERMS_CONDITIONS});
    if (!isAboutUsExist) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "Your condition data was not exist!"
        )
    };

    return isAboutUsExist;
};

const create_conditon = async (
    payload: JwtPayload,
    data : about_us
): Promise<any> => {
    
    await User.isValidUser(payload.id)
    
    const isAboutUsExist = await Policie.findOne({type: policie_type.TERMS_CONDITIONS});
    if (isAboutUsExist) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "Already another condition data was exist you must delete the older one to create a new one or you can update the older one!"
        )
    };

    const newPoliciData = await Policie.create({
        context: data.data,
        type: policie_type.TERMS_CONDITIONS
    });

    return newPoliciData;
};

const update_condition = async (
    payload: JwtPayload,
    data : about_us
): Promise<any> => {
    
    await User.isValidUser(payload.id);
    
    const isAboutUsExist = await Policie.findOne({type: policie_type.ABOUT_US});
    if (!isAboutUsExist) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "condition data was not exist at first you must create the about us data to update the data!"
        )
    };

    const newPoliciData = await Policie.findOneAndUpdate(
        {
            type: policie_type.ABOUT_US
        },
        {
            data: data.data
        },
        { 
            new: true
        }
    );

    return newPoliciData;
};

export const AdminServices = {
  create_about_us,
  get_about_us,
  update_about_us,
  get_condition_data,
  create_conditon,
  update_condition
};
