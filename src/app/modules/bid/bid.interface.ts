import { Types } from "mongoose";
import { BID_STATUS } from "../../../enums/bid";

export interface BidI {
    adventurer: Types.ObjectId;
    quizeGiver: Types.ObjectId;
    service: Types.ObjectId;
    createdBy: Types.ObjectId;
    lastBid: Types.ObjectId;
    isAccepted: BID_STATUS;
    offer_ammount: number;
    reason: string;
    isPaid: boolean;
    isCanceled: boolean;
}