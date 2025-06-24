import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { JwtPayload } from 'jsonwebtoken';
import { Bids, sendBid } from '../../../types/bid';
import { User } from '../user/user.model';
import { Post } from '../post/post.model';
import { NotificationModel } from '../notification/notification.model';
import { socketHelper } from '../../../helpers/socketHelper';
import mongoose from 'mongoose';
import { Bid } from './bid.model';

const sendBid = async (
  payload: JwtPayload,
  data: Bids
) => {
  const { id } = payload;
  const sender = await User.isValidUser(id);
  
  const objID = new mongoose.Types.ObjectId(data.postID);
 
  const post = await Post.findById(objID).lean().exec();
  if (!post) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Post was not found!"
    )
  }

  const bid = await Bid.create({
    adventurer: sender._id,
    quizeGiver: post.createdBy,
    offer_ammount: post.amount,
    service: post._id
  })
  if (!bid) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Can't create a bid!"
    )
  }

  const notification = await NotificationModel.create({
    for: post?.createdBy,
    from: sender._id,
    title: `You got a bid from ${sender.name}`,
    discription: `${data.reason}`,
    content: data.amount
  })
  if (!notification) {
    throw new ApiError(
      StatusCodes.NOT_ACCEPTABLE,
      "Notification not created!"
    )
  }

  const targetSocketId = socketHelper.connectedUsers.get(post!.createdBy!.toString());
  
  // @ts-ignore
  const io = global.io;

  if (targetSocketId) {
    io.to(targetSocketId).emit(`socket:notification:${post.createdBy}`, notification);
  }

  return notification;
};

const bidRequests = async (
  payload: JwtPayload,
  data: {
    page: number,
    limit: number
  }
) => {
  const { page= 1, limit=10 } = data;
  const user = await User.isValidUser(payload.id);

  const skipCount = (page - 1) * limit;

  const requests = await Bid.find({quizeGiver: user._id})
                            .skip(skipCount)
                            .limit(limit)

  return requests
};

const bidRequesteAsAdvengerer = async (
  payload: JwtPayload,
  data: {
    page: number,
    limit: number
  }
) => {
  const { page, limit } = data
  const user = await User.isValidUser(payload.id);

  const skipCount = (page - 1) * limit;

  const bidCreate = await Bid.find({adventurer: user._id})
                             .skip(skipCount)
                             .limit(limit)

  return bidCreate
};

export const BidService = {
  sendBid,
  bidRequests,
  bidRequesteAsAdvengerer
};
