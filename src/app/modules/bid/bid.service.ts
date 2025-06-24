import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { JwtPayload } from 'jsonwebtoken';
import { Bids } from '../../../types/bid';
import { User } from '../user/user.model';
import { Post } from '../post/post.model';
import { NotificationModel } from '../notification/notification.model';
import { socketHelper } from '../../../helpers/socketHelper';
import mongoose from 'mongoose';

const sendBid = async (
  payload: JwtPayload,
  data: Bids
) => {
  const { id } = payload;
  const sender = await User.isValidUser(id);
  
  const objID = await new mongoose.Types.ObjectId(data.to);
 
  const user = await User.findById(objID).lean().exec();

  const notification = await NotificationModel.create({
    for: user,
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

  const targetSocketId = socketHelper.connectedUsers.get(user!._id.toString());
  
  // @ts-ignore
  const io = global.io;

  if (targetSocketId) {

    console.log(targetSocketId)
    io.to(targetSocketId).emit(`socket:notification:${user?._id}`, notification);
  }

  return notification;
};

export const BidService = {
  sendBid,
};
