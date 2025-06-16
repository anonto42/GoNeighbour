import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../../errors/ApiError";
import { postT } from "../../../types/post";
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
        
        data.images.map( e => unlinkFile(e) );
        
        return createdPost
        
    } catch (error: any) {
        
        data.images.map( e => unlinkFile(e) );

        throw new ApiError(
            error.status,
            error.message
        )
    }
}



export const PostService = {
    createPost
}