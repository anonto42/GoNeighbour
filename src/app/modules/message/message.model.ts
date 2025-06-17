import { model, Schema, Types } from "mongoose";
import { IMessage, MessageModel } from "./message.interface";

const messageSchema = new Schema<IMessage>({
    chatRoom: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    sender: {
        type: Types.ObjectId,
        ref: "user"
    }
},{
    timestamps: true
})

export const Message = model<IMessage, MessageModel>("message", messageSchema);