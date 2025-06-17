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

        data.createdBy = new Types.ObjectId( data.createdBy )

        await User.isValidUser(payload.id);

        const isPostExist = await Post.findOne({title: data.title});
        if (isPostExist) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                `Already post exist on the named: ${data.title}`
            )
        }
        const createdPost = await Post.create(data);
        
        // data.images.map( e => unlinkFile(e) );
        
        return createdPost
        
    } catch (error: any) {
        
        data.images.map( e => unlinkFile(e) );

        throw new ApiError(
            error.status,
            error.message
        )
    }
}

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
}

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
}

export const PostService = {
    createPost,
    aPost,
    updatedPost
}