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
import { Payment } from '../payments/payment.model';
import { v4 } from 'uuid';

const sendBid = async (
  payload: JwtPayload,
  data: Bids
) => {
  const { id } = payload;

  const userObjId = new mongoose.Types.ObjectId(id);
  const sender = await User.findById(userObjId);
  if (!sender) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "User not found!"
    )
  }

  await checkBidCancellationStatus(sender);

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
  };

  const adventurer = post.createdBy != sender._id ? sender._id : post.createdBy;
  const quizeGiver = post.createdBy == sender._id ? sender._id : post.createdBy;

  const bid = await Bid.create({
    adventurer: adventurer,
    quizeGiver: quizeGiver,
    offer_ammount: post.amount,
    createdBy: payload.id,
    reason: data.reason,
    service: post._id,
    isAccepted_fromAdventurer: adventurer == id ? BID_STATUS.ACCEPTED : BID_STATUS.WATING,
    isAccepted_fromQuizeGiver: quizeGiver == id ? BID_STATUS.ACCEPTED : BID_STATUS.WATING
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
    select: ' _id title amount',
  })
  .populate({
    path: 'createdBy',
    select: ' _id name email image',
  })
  .populate({
    path: 'adventurer',
    select: ' _id name email image',
  })
  .populate({
    path: 'quizeGiver',
    select: ' _id name email image',
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
                              .populate({
                                path: 'service',
                                select: ' _id title amount',
                              })
                              .populate({
                                path: 'createdBy',
                                select: ' _id name email image',
                              })
                              .populate({
                                path: 'adventurer',
                                select: ' _id name email image',
                              })
                              .populate({
                                path: 'quizeGiver',
                                select: ' _id name email image',
                              })
                             .skip(skipCount)
                             .limit(limit)

  return bidCreate
};

const intrigateWithBid = async (
  payload: JwtPayload,
  bidID: string,
  action: boolean
) => {

  const userObjId = new mongoose.Types.ObjectId(payload.id);
  const user = await User.findById(userObjId);
  if (!user) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "User not found!"
    )
  }

  await checkBidCancellationStatus(user);

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

  if (payload.id == bid.adventurer) {
      if (
        bid.isAccepted_fromAdventurer == BID_STATUS.ACCEPTED || 
        bid.isAccepted_fromAdventurer == BID_STATUS.DENY) {
          throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "BID was interrupted!"
          )
      }
    } else {
      if (
        bid.isAccepted_fromQuizeGiver == BID_STATUS.ACCEPTED || 
        bid.isAccepted_fromQuizeGiver == BID_STATUS.DENY) {
          throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "BID was interrupted!"
          )
      }
    }

  if (action == true) {

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

    if ( bid.isAccepted_fromAdventurer == BID_STATUS.ACCEPTED && bid.isAccepted_fromQuizeGiver == BID_STATUS.ACCEPTED ) {
      await Task.create({ 
        customer: bid.quizeGiver,
        provider: bid.adventurer,
        service: bid.service,
        bid: bid._id
      })

      return true
    }

    return true;

  } else if (action == false) {

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

    return true;
  }


};

const paytheBid = async (
  payload: JwtPayload,
  bidID: string
) => {

  const objID = new mongoose.Types.ObjectId(bidID);
  const bid = await Bid.findById(objID);
  if (!bid) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "BID not founded!"
    )
  }

  const quizegiver = await User.findById(bid.quizeGiver);
  if (!quizegiver) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "QuizeGiver not founded!"
    )
  }

  const userObjId = new mongoose.Types.ObjectId(payload.id);
  const user = await User.findById(userObjId);
  if (!user) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "User not founded!"
    )
  }

  const adventurerObjId = new mongoose.Types.ObjectId(bid.adventurer);
  const adventurer = await User.findById(adventurerObjId);
  if (!adventurer) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Adventurer not founded!"
    )
  }

  if( bid.quizeGiver.toString() != user._id.toString() ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You are not the quizeGiver!"
    )
  }

  if (user.balance < bid.offer_ammount) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You don't have enough balance to pay the adventurer! at first add balance to your account!"
    )
  }

  const commission = bid.offer_ammount * 0.5;

  const task = await Task.findOne({bid: bid._id});
  if (!task) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Task not found!"
    )
  }

  const uniqueID = v4().replace(/-/g, '').slice(0, 16);;

  const paytment = await Payment.create({
    taskID:task,
    transactionId: uniqueID,
    commission
  })

  user.balance -= bid.offer_ammount;
  user.totalSpent += bid.offer_ammount;
  adventurer.totalEarn += bid.offer_ammount;
  adventurer.balance += bid.offer_ammount;
  bid.isPaid = true;

  quizegiver.complitedTasks.push(bid._id);
  adventurer.complitedTasks.push(bid._id);
  
  await bid.save();
  await user.save();
  await quizegiver.save();
  await adventurer.save();

  return paytment;
};

const checkBidCancellationStatus = async (user: any) => {
  
  if (user.bidCancelation.bannedFor > new Date(Date.now())) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You are not allowed to perform this action because you are blocked for 3 days."
    )
  }

  if (user.bidCancelation.bannedFor < new Date(Date.now())) {
    user.bidCancelation.bidCancelationAvailable = 3;
    user.bidCancelation.bannedFor = null;
    await user.save();
  }

  if (user.bidCancelation.bidCancelationAvailable <= 0) {
    user.bidCancelation.bannedFor = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); 
    await user.save();
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You have no cancellations left. You are blocked for 3 days."
    )
  }
};

const cancelTask = async (payload: JwtPayload, bidID: string) => {
  const objID = new mongoose.Types.ObjectId(bidID);
  const bid = await Bid.findById(objID);
  if (!bid) {
    throw new ApiError(StatusCodes.NOT_FOUND, "BID not found!");
  }

  if (bid.adventurer.toString() != payload.id && bid.quizeGiver.toString() != payload.id) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You are not the adventurer or quizeGiver of this bid!"
    )
  }

  const userObjId = new mongoose.Types.ObjectId(payload.id);
  const user = await User.findById(userObjId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  }

  await checkBidCancellationStatus(user);

  user.bidCancelation.bidCancelationAvailable -= 1;
  bid.isCanceled = true;
  await bid.save();
  await user.save();

  return true;
};

export const BidService = {
  sendBid,
  paytheBid,
  cancelTask,
  bidRequests,
  intrigateWithBid,
  bidRequesteAsAdvengerer,
  checkBidCancellationStatus
};