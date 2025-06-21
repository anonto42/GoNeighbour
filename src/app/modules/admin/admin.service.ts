import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { about_us } from '../../../types/admin';
import { User } from '../user/user.model';
import { Policie } from '../policies/policie.model';
import { policie_type } from '../../../enums/policie';
import { STATUS } from '../../../enums/user';

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

    isAboutUsExist.context = data.data;
    await isAboutUsExist.save();

    return
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

    isAboutUsExist.context = data.data
    await isAboutUsExist.save();

    return
};

const get_faq_data = async (
    payload: JwtPayload,
): Promise<any> => {
    
    await User.isValidUser(payload.id)
    
    const isAboutUsExist = await Policie.findOne({type: policie_type.FAQ});
    if (!isAboutUsExist) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "FAQ data was not exist!"
        )
    };

    return isAboutUsExist;
};

const create_faq = async (
    payload: JwtPayload,
    data : about_us
): Promise<any> => {
    
    await User.isValidUser(payload.id)
    
    const isAboutUsExist = await Policie.findOne({type: policie_type.FAQ});
    if (isAboutUsExist) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "Already another faq data was exist you must delete the older one to create a new one or you can update the older one!"
        )
    };

    const newPoliciData = await Policie.create({
        context: data.data,
        type: policie_type.FAQ
    });

    return newPoliciData;
};

const update_faq = async (
    payload: JwtPayload,
    data : about_us
): Promise<any> => {
    
    await User.isValidUser(payload.id);
    
    const isAboutUsExist = await Policie.findOne({type: policie_type.FAQ});
    if (!isAboutUsExist) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "FAQ data was not exist at first you must create the about us data to update the data!"
        )
    };

    isAboutUsExist.context = data.data
    await isAboutUsExist.save()

    return
};

const getAllUsers = async (
    payload: JwtPayload,
    data: { 
        limit: number; 
        page: number;
    }
): Promise<any> => {

    await User.isValidUser(payload.id);

    const { limit = 10, page = 1 } = data;

    const skipCount = (page - 1) * limit;

    const allAdminUsers = await User.find()
                                    .select("-password -authentication -__v")
                                    .skip(skipCount)
                                    .limit(limit);

    return allAdminUsers;
};

const blockAUser = async (
    userID: any
): Promise<any> => {

    const user = await User.findById(userID);
    if (!user) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "user not found!"
        )
    };

    user.status = user.status == STATUS.BLOCKED? STATUS.ACTIVE : STATUS.BLOCKED;
    await user.save();

    return true;
};

// Have a todo after creating the bid and other oparations
// it will need the aggrigation
const getAUser = async (
    userid: string
) => {

    const user = await User
                        .findById(userid)
                        .select("-authentication -searchKeywords -__v -createdAt -updatedAt")

    if (!user) {
        throw new ApiError(
            StatusCodes.BAD_GATEWAY,
            "User not found to send the data!"
        )
    }

    return user;
};

export const AdminServices = {
  create_about_us,get_about_us,update_about_us,
  get_condition_data,create_conditon,update_condition,
  get_faq_data,create_faq,update_faq,
  getAllUsers,blockAUser,getAUser
};
