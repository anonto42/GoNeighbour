import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { JwtPayload } from 'jsonwebtoken';
import { Bids } from '../../../types/bid';
import { User } from '../user/user.model';
import { Post } from '../post/post.model';

//@ts-ignore
const io = global.io; // Socket added for all live events

const sendBid = async (
  payload: JwtPayload,
  data: Bids
) => {
  const { id } = payload;
  await User.isValidUser(id);

  const task = await Post.findById(data.postID)
  if (!task) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST, 
      "User doesn't exist!"
    );
  };


  return { };
};

export const BidService = {
  sendBid,
};
