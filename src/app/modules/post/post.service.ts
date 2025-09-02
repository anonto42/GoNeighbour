import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../../errors/ApiError";
import { postT, updatePostT } from "../../../types/post";
import { User } from "../user/user.model";
import unlinkFile from "../../../shared/unlinkFile";
import { Post } from "./post.model";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";

const createPost = async (
    payload: JwtPayload,
    data: postT
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

        const isPostExist = await Post.findOne({title: data.title});
        if (isPostExist) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                `Already post exist on the named: ${data.title}`
            )
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
                                .populate("createdBy","reviews image email name -_id")
                                .select("-lat -lot -__v -location")
    if (!isPostExist) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "Post dos't exist!"
        )
    }

    return isPostExist
};

const updatedPost = async (
    payload: JwtPayload,
    data: updatePostT
) => {
    try {

        await User.isValidUser(payload.id);

        const isPostExist = await Post.findById(data.postId);
        if (!isPostExist) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                `Post not founded to update!`
            )
        }
        const createdPost = await Post.findByIdAndUpdate(data.postId,data,{ new: true });
        
        // if (data.images && data.images.length > 0) {
        //     isPostExist.images.map( e => unlinkFile(e) );
        // }
        
        return createdPost
        
    } catch (error: any) {

        console.log(error)
        if (data.images && data.images.length > 0) {
            data.images.map( e => unlinkFile(e) );
        }

        throw new ApiError(
            error.status,
            error.message
        )
    }
};

const lastPosts = async (
    user: JwtPayload,
    limit: number,
    page: number
) => {
    const userFromDB = await User.isValidUser(user.id);
    
    const skipCount = (page - 1) * limit;

    const posts = await Post.find({ createdBy: userFromDB._id })
        .populate("createdBy","name email image")
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
    console.log(favorites)

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

    user.favorites = user.favorites.filter( e => e != id );

    user.save();

    return true
};

export const PostService = {
    createPost,
    aPost,
    updatedPost,
    removeFromFavorite,
    lastPosts,
    addToFavorite,
    getFavorite,
    woneCreatedPosts,
    deletePost
}