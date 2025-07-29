import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import { filterType, giveReviewType, register } from '../../../types/user';
import { Post } from '../post/post.model';
import SearchKeyword from '../keywords/search.model';
import validator from 'validator';
import bcrypt from "bcrypt"
import config from '../../../config';
import { Suport } from '../suport/suport.model';
import { NotificationModel } from '../notification/notification.model';
import { socketHelper } from '../../../helpers/socketHelper';
import { Types } from 'mongoose';

const createUserToDB = async (payload: Partial<register>): Promise<any> => {
  await User.isExistUserByEmail(payload.email!);

  const hashPasswod = await bcrypt.hash(
    payload!.password!,
    Number(config.bcrypt_salt_rounds)
  );

  const user = {
    name: payload.first_name + " " + payload.last_name,
    email: payload.email,
    password: hashPasswod,
    role: USER_ROLES.USER
  }

  const createUser = await User.create(user);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  };

  //send email
  const otp = generateOTP();
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 5 * 60000),
  };
  await User.findOneAndUpdate(
    { _id: createUser._id },
    { $set: { authentication } }
  );

  return {
    name: createUser.name,
    email: createUser.email,
    image: createUser.image,
  };
};

const getUserProfileFromDB = async (
  user: JwtPayload
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.isValidUser(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  };

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
) => {
  try {
    const { id } = user;
    const isExistUser = await User.isValidUser(id);
  
    //unlink file here
    if (payload.image) {
      unlinkFile(isExistUser.image);
    };
  
    const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
      new: true,
    }).select("-password -verified -authentication").lean().exec();
  
    unlinkFile(payload.image!)
    return updateDoc;
    
  } catch (error: any) {
    unlinkFile(payload.image as string)
    throw new ApiError(
      error.status,
      error.message
    )
  };
};

const searchData = async (
  payload: JwtPayload,
  keyword: string, 
  page: number = 1, 
  limit: number = 10
) => {
  
    if (typeof keyword !== 'string' || keyword.trim().length === 0) {
        throw new Error('Invalid keyword format');
    }

    const sanitizedKeyword = validator.escape(keyword.trim()); 

    const skipCount = (page - 1) * limit;

    const posts = await Post.find({
        $or: [
            { title: { $regex: sanitizedKeyword, $options: 'i' } }, 
            { description: { $regex: sanitizedKeyword, $options: 'i' } }
        ]
    })
    .skip(skipCount) 
    .limit(limit);  

    if (posts.length === 0) {
        const randomPosts = await Post.aggregate([
            { $sample: { size: limit } } 
        ]);
        return randomPosts;
    }

    const searchKeyword = await SearchKeyword.findOne({ keyword: sanitizedKeyword });
    if (searchKeyword) {
        searchKeyword.count += 1; 
        await searchKeyword.save();
    } else {
        await SearchKeyword.create({ keyword: sanitizedKeyword });  
    }

    const user = await User.findById(payload.id);
    if (user) {
      user.searchKeywords.unshift(keyword);
  
      if (user.searchKeywords.length > 5) {
        user.searchKeywords.pop();
      }
  
      await user.save();
    }

    return posts;
};

const getTopSearchedKeywords = async (limit: number = 10) => {
  
  const topKeywords = await SearchKeyword.find()
    .sort({ count: -1 }) 
    .limit(limit);
  
  return topKeywords;
};

const home_data = async (
  paylod: JwtPayload,
  page: number = 1,
  limit: number = 10
) => {
  const user = await User.findById(paylod.id);

  if (!user) {
      throw new Error('User not found');
  }

  const searchKeywords = user.searchKeywords;

  if (searchKeywords.length === 0) {
      const randomPosts = await Post.aggregate([
          { $sample: { size: limit } }
      ]);
      return randomPosts;
  }

  const skipCount = (page - 1) * limit;

  const posts = await Post.find({
      $or: searchKeywords.map((keyword: string) => ({
          $or: [
              { title: { $regex: keyword, $options: 'i' } },
              { description: { $regex: keyword, $options: 'i' } }
          ]
      }))
  })
  .skip(skipCount) 
  .limit(limit); 

  return posts;
} 

const userReport_request = async (
  user: JwtPayload,
  data: {
    title: string,
    description: string,
    image: string
  }
) => {
  try {

    const userData = await User.isValidUser(user.id);
    const admin = await User.find({role: USER_ROLES.ADMIN}).lean().exec();
    const totalAdmin = admin.map(adminUser => ({
        id: adminUser._id.toString(),
        name: adminUser.name,
        email: adminUser.email,
    }));
    const suport = await Suport.create({
      user: userData._id,
      title: data.title,
      description: data.description,
      image: data.image
    });

    //@ts-ignore
    const io = global.io

    for ( let data of totalAdmin ){
      
      const not = await NotificationModel.create({
        from: suport.user,
        content: suport.image,
        discription: suport.description,
        //@ts-ignore
        for: data._id,
        title: suport.title
      })
      //@ts-ignore
      const targetSocketId = socketHelper.connectedUsers.get(data.id);
      if (targetSocketId) {
        //@ts-ignore
        io.to(targetSocketId).emit(`socket:notification:${data.id}`, not);
      }
    };

    return suport

  } catch (error: any) {
    
    if (data.image) {
      unlinkFile(data.image)
    }
    throw new ApiError(StatusCodes.NOT_FOUND, error.message)
  }
}

const wone_created_suports = async (
  userID: string,
  option: {
    limit: number,
    page: number
  }
) => {
  const user = await User.isValidUser( userID );
  const skipCount = (option.page - 1) * option.limit;

  return await Suport.find({user: user._id}).populate("user","name email image").skip(skipCount).limit(option.limit)
}

const filterdata = async (
  user: JwtPayload,
  data: filterType
) => {
  const { maxDistance, maxPrice, minPrice, userLat, userLng } = data;
  const userFromDB = await User.isValidUser(user.id);

  const posts = await Post.find({
    location:{
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [userLng, userLat]
        },
        $maxDistance: maxDistance
      }
    },
    amount: {
      $gte: minPrice,
      $lte: maxPrice
    }
  }).exec();

  return posts;
}

const getNotifications = async (
  user: JwtPayload,
  option: {
    limit: number,
    page: number
  }
) => {
  const userFromDB = await User.isValidUser( user.id );
  const skipCount = (option.page - 1) * option.limit;

  return await NotificationModel.find({for: userFromDB._id})
    .populate("for","name email image")
    .populate("from","name email image")
    .skip(skipCount).limit(option.limit)
}

const giveReview = async (
  data: giveReviewType
) => {

  const userObj = new Types.ObjectId(data.user_id);
  const user = await User.findById(userObj);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  };

  const review = {
    star: data.star,
    comment: data.comment,
    from: data.from
  };

  user.reviews.push(review);  
  await user.save();

  return review;

}

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  searchData,
  getTopSearchedKeywords,
  home_data,
  userReport_request,
  wone_created_suports,
  filterdata,
  getNotifications,
  giveReview
};  
