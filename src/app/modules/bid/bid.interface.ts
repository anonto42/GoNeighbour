import { Types } from "mongoose";
import { BID_STATUS } from "../../../enums/bid";

export interface BidI {
    adventurer: Types.ObjectId;
    quizeGiver: Types.ObjectId;
    service: Types.ObjectId;
    parent_bid: Types.ObjectId;
    re_bids: BidI[]
    isAccepted_fromAdventurer: BID_STATUS;
    isAccepted_fromQuizeGiver: BID_STATUS;
    offer_ammount: number;
}