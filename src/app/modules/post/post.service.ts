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

        const user = await User.isValidUser(payload.id);

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
        const createdPost = await Post.findByIdAndUpdate(data.postId,data,{ new: true }).select("-location - lat -lot");
        
        if (data.images.length > 0) {
            isPostExist.images.map( e => unlinkFile(e) );
        }
        
        return createdPost
        
    } catch (error: any) {
        
        if (data.images.length > 0) {
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

const addTofavorite = async (
    user: JwtPayload,
    postID: string
) => {
    const userFromDB = await User.isValidUser( user.id );
    const userO = await User.findById(userFromDB._id);
    const isPostExist = await Post.findById(postID);
    if (!isPostExist) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "Post not founded!"
        )
    };

    userO?.favorites.push(isPostExist._id);
    await userO?.save();

    return true
};

const getFavorite = async (
    user: JwtPayload,
    limit: number,
    page: number
) => {
    const userFromDB = await User.isValidUser(user.id);

    const skipCount = (page - 1) * limit;

    const userWithFavorites = await User.findById(userFromDB._id)
                                        .select("-location -__v -lat -lot")
                                        .populate({
                                            path: 'favorites',
                                            populate: {
                                                path: 'createdBy', 
                                                select: 'name email image'  
                                            }
                                        });

    if (!userWithFavorites || !userWithFavorites.favorites) {
        return [];  
    }

    const paginatedFavorites = userWithFavorites.favorites.slice(skipCount, skipCount + limit);

    const formattedFavorites = paginatedFavorites.map((favorite: any) => {
    const favoriteData = favorite.toObject(); 

    delete favoriteData.location;
    delete favoriteData.__v;

    return {
        ...favoriteData, 
        createdBy: favorite.createdBy ? {
            name: favorite.createdBy.name,
            email: favorite.createdBy.email,
            image: favorite.createdBy.image
        } : null 
    };
})

    return formattedFavorites;
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
    addTofavorite,
    getFavorite,
    woneCreatedPosts
}