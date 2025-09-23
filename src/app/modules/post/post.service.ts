import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../../errors/ApiError";
import { updatePostT } from "../../../types/post";
import { User } from "../user/user.model";
import unlinkFile from "../../../shared/unlinkFile";
import { Post } from "./post.model";
import { StatusCodes } from "http-status-codes";
import mongoose, { Types } from "mongoose";
import { postInterface } from "./post.interface";

const createPost = async (
    payload: JwtPayload,
    data: postInterface
) => {
    try {

        const objid = new Types.ObjectId(payload.id);
        const user = await User.findById(objid);

        if (!user) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                "User not found!"
            )
        }

        if (!user.faceVerifyed) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "Please verify your identity with nid to create a post!"
            )
        }

        if( user.balance < data.amount ) throw new ApiError(StatusCodes.BAD_REQUEST,"You don't have enough balance to create a post!, you must add balance to your account!")
        
        data.createdBy = new Types.ObjectId( user._id )

        //@ts-ignore
        data.address = data.location

        data.location = {
            type: "Point",
            coordinates: [//@ts-ignore
                data.lon,
                data.lat
            ],
        }

        const createdPost = await Post.create(data);

        user.totalPosts.push(createdPost._id);
        await user.save();
        
        return createdPost
        
    } catch (error: any) {
        
        data.images.map( e => unlinkFile(e) );

        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            error.message
        )
    }
};

const woneCreatedPosts = async (
    payload: JwtPayload, 
    page: number = 1,  
    limit: number = 10   
) => {
    const user = await User.isValidUser(payload.id);

    const skipCount = (page - 1) * limit;

    const posts = await Post.find({ createdBy: user._id })
        .skip(skipCount)
        .limit(limit)
        .lean() 
        .exec();

    return posts;
};

const aPost = async (
    payload: JwtPayload,
    postId: any
) => {

    await User.isValidUser(payload.id);

    const isPostExist = await Post
                                .findById(postId)
                                .populate("createdBy","reviews image email name _id")
                                .select("-lat -lot -__v -location")
    if (!isPostExist) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "Post dos't exist!"
        )
    }

    return isPostExist
};

const updatedPost = async (payload: JwtPayload, data: updatePostT) => {
  await User.isValidUser(payload.id);

  const isPostExist = await Post.findById(data.postId);
  if (!isPostExist) throw new ApiError(StatusCodes.BAD_REQUEST, "Post not found");

//   function stringToArray(str: string): string[] {
//     if (!str) return [];
//     let cleaned = str.trim().replace(/,\s*]$/, "]");
//     try { return JSON.parse(cleaned); } 
//     catch { 
//       const matches = cleaned.match(/"([^"]+)"/g);
//       return matches ? matches.map(s => s.replace(/"/g, "")) : [];
//     }
//   }

    if(
        typeof (data.oldImages) === "string"
    ){
        data.oldImages = [data.oldImages]
    } else {
        data.oldImages = data.oldImages
    }


    if (data.images && data.oldImages) {
            if (data.images.length > 0) {
                if (data.oldImages.length > 0) {
                isPostExist.images = [
                    ...data.oldImages,
                    ...data.images
                ]
            }
        }
    } else if (data.oldImages) {
        if (data.oldImages.length > 0) {
            isPostExist.images = [
                ...data.oldImages
                ]
            }
        }

    if (data.title) isPostExist.title = data.title;
    if (data.amount) isPostExist.amount = data.amount;

    if (data.location && typeof data.location === "object") {
        isPostExist.location = data.location;
    }

    //@ts-ignore
    if (data.deadline) isPostExist.deadline = parseNullableDate(data.deadline);
    //@ts-ignore
    if (data.work_time) isPostExist.work_time = parseNullableDate(data.work_time);
    //@ts-ignore
    if (data.location) isPostExist.address = data.location;
    if (data.lat) isPostExist.lat = data.lat;
    if (data.lot) isPostExist.lot = data.lot;
    if (data.description) isPostExist.description = data.description;

    await isPostExist.save();
};

function parseNullableDate(value: string | null | undefined) {
  if (!value || value === "null") return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

const lastPosts = async (
    user: JwtPayload,
    limit: number,
    page: number
) => {
    const userFromDB = await User.isValidUser(user.id);
    
    const skipCount = (page - 1) * limit;

    const posts = await Post.find({ createdBy: userFromDB._id })
        .populate("createdBy","name email image")
        .select(" -lat -lot")
        .skip(skipCount)
        .limit(limit)
        .sort({ createdAt: -1 });

    return posts;
};

const addToFavorite = async (
  user: JwtPayload,
  postID: string
): Promise<boolean> => {
    
  const userFromDB = await User.findById(user.id);
  if (!userFromDB) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid user");
  }

  const post = await Post.findById(postID);
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }

  const isAlreadyFavorite = userFromDB.favorites?.some(
    (favPostId: any) => favPostId.toString() === postID
  );

  if (isAlreadyFavorite) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Post already favorited");
  }

  userFromDB.favorites.push(post._id);
  await userFromDB.save();

  return true;
};

const deletePost = async (
    user: JwtPayload,
    postID: string
) => {
    console.log(postID)
    const userFromDB = await User.isValidUser(user.id);
    const isPostExist = await Post.findById(postID);
    if (!isPostExist) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "Post not founded!"
        )
    };

    await Post.deleteOne({ _id: postID });

    return true
};

const getFavorite = async (
  user: JwtPayload,
  limit: number,
  page: number
) => {
  const userFromDB = await User.isValidUser(user.id);

  if (!userFromDB?.favorites || userFromDB.favorites.length === 0) {
    return [];
  }

  const skipCount = (page - 1) * limit;

  const favorites = await Post.find({ _id: { $in: userFromDB.favorites } })
    .select("-location -__v")
    .populate({
      path: "createdBy",
      select: "name email image"
    })
    .skip(skipCount)
    .limit(limit)
    .lean();

  return favorites.map((fav: any) => ({
    ...fav,
    createdBy: fav.createdBy ? {
      name: fav.createdBy.name,
      email: fav.createdBy.email,
      image: fav.createdBy.image
    } : null
  }));
};

const removeFromFavorite = async (
    payload: JwtPayload,
    id: any
) => {

    const user = await User.findById(payload.id);
    if (!user) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "User not found!"
        )
    }

    const isFavorite = user.favorites.includes(id);
    if (!isFavorite) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Post not found in favorites!"
        );
    }

    user.favorites = user.favorites.filter( e => e != id );

    user.save();

    return false
};

const postDataWithCordinats = async ( id: string ) => await Post.find({ createdBy: { $ne: new mongoose.Types.ObjectId( id )}}).sort({ createdAt: -1 }).select("location title description amount").lean();

const skipFrom = async (user: string, id: string) => {
  const post = await Post.findById(new mongoose.Types.ObjectId(id));
  if (!post) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "The post was not available!"
    );
  }

  const userId = new mongoose.Types.ObjectId(user);

  // check if user already in skipFrom
  if (!post.skipFrom.some(existing => existing.equals(userId))) {
    post.skipFrom.push(userId);
    await post.save();
  }

  return post.skipFrom;
};

export const PostService = {
    createPost,
    postDataWithCordinats,
    aPost,
    skipFrom,
    updatedPost,
    removeFromFavorite,
    lastPosts,
    addToFavorite,
    getFavorite,
    woneCreatedPosts,
    deletePost
};