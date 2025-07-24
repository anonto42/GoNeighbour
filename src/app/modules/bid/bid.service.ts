import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { JwtPayload } from 'jsonwebtoken';
import { Bids } from '../../../types/bid';
import { User } from '../user/user.model';
import { Post } from '../post/post.model';
import { NotificationModel } from '../notification/notification.model';
import { socketHelper } from '../../../helpers/socketHelper';
import mongoose from 'mongoose';
import { Bid } from './bid.model';
import { Task } from '../task/task.model';
import { BID_STATUS } from '../../../enums/bid';

const sendBid = async (
  payload: JwtPayload,
  data: Bids
) => {
  const { id } = payload;
  const sender = await User.isValidUser(id);

  if (!sender.faceVerifyed) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Please verify your identity with nid to send a bid!"
    )
  }
  
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
    createdBy: payload.id,
    reason: data.reason,
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
    discription: `${data.reason}`
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

  const requests = await Bid.find({ quizeGiver: user._id })
  .populate({
    path: 'service',
    select: '-authentication -password -createdAt -updatedAt -__v -searchKeywords -favorites -faceVerifyed',
  })
  .populate({
    path: 'createdBy',
    select: '-authentication -password -createdAt -updatedAt -__v -searchKeywords -favorites -faceVerifyed',
  })
  .populate({
    path: 'adventurer',
    select: '-authentication -password -createdAt -updatedAt -__v -searchKeywords -favorites -faceVerifyed',
  })
  .populate({
    path: 'quizeGiver',
    select: '-authentication -password -createdAt -updatedAt -__v -searchKeywords -favorites -faceVerifyed',
  })
  .skip(skipCount)
  .limit(limit);

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

const intrigateWithBid = async (
  payload: JwtPayload,
  bidID: string,
  action: boolean
) => {

  const user = await User.isValidUser(payload.id);
  if (!user.faceVerifyed) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Please verify your identity with nid to intrigate with a bid!"
    )
  }

  const objID = new mongoose.Types.ObjectId(bidID);
  const bid = await Bid.findById(objID);
  
  if (!bid) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "BID not founded!"
    )
  };

  if (action) {

    const notification = await NotificationModel.create({
      for: bid.adventurer,
      from: payload.id,
      title: `your bit was accepted!`,
      discription: `${bid.reason}`
    })

    if (!notification) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "Notification not created!"
      )
    }

    
    const targetSocketId = socketHelper.connectedUsers.get(bid.createdBy.toString());
    
    // @ts-ignore
    const io = global.io;
    if (targetSocketId) {
      io.to(targetSocketId).emit(`socket:notification:${ bid.createdBy.toString() }`, notification);
    }

    if (payload.id == bid.adventurer) {
      bid.isAccepted_fromAdventurer = BID_STATUS.ACCEPTED;
    } else {
      bid.isAccepted_fromQuizeGiver = BID_STATUS.ACCEPTED;
    }
    
    await bid.save();

    if ( payload.id != bid.createdBy ) {
      await Task.create({ 
        customer: bid.quizeGiver,
        provider: bid.adventurer,
        service: bid.service,
        bid: bid._id
      })

      return "Task created successfully!"
    }

    return true;
    
  } else if (!action) {

    const notification = await NotificationModel.create({
      for: bid.adventurer,
      from: payload.id,
      title: `your bit was Deny!`,
      discription: `${bid.reason}`,
    })
    if (!notification) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "Notification not created!"
      )
    }

    if (payload.id == bid.adventurer) {
      bid.isAccepted_fromAdventurer = BID_STATUS.DENY;
    } else {
      bid.isAccepted_fromQuizeGiver = BID_STATUS.DENY;
    }

    await bid.save();

    const targetSocketId = socketHelper.connectedUsers.get(bid.createdBy.toString());
    
    // @ts-ignore
    const io = global.io;

    if (targetSocketId) {
      io.to(targetSocketId).emit(`socket:notification:${bid.createdBy.toString()}`, notification);
    }    
  }


};

export const BidService = {
  sendBid,
  bidRequests,
  intrigateWithBid,
  bidRequesteAsAdvengerer,
};