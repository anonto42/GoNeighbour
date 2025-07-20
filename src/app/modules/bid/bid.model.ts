import { model, Schema } from "mongoose";
import { BidI } from "./bid.interface";
import { BID_STATUS } from "../../../enums/bid";

const bidSchema = new Schema<BidI>({
    adventurer:{
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    quizeGiver:{
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    isPaid:{
        type: Boolean,
        default: false
    },
    service:{
        type: Schema.Types.ObjectId,
        ref: "post" 
    },
    isAccepted_fromAdventurer:{
        type: String,
        enum: BID_STATUS,
        default: BID_STATUS.WATING
    },
    isAccepted_fromQuizeGiver:{
        type: String,
        enum: BID_STATUS,
        default: BID_STATUS.WATING
    },
    offer_ammount:{
        type: Number,
        default: 0
    },
    reason:{
        type: String
    }
},{
    timestamps: true
})


export const Bid = model<BidI>("bid", bidSchema)