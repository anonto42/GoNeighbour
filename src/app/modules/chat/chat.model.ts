import { model, Schema } from "mongoose";
import { ChatModel, IChat } from "./chat.interface";


const chatRoom = new Schema<IChat, ChatModel>({
    name: {
        type: String
    },
    participants:{
        type: [Schema.Types.ObjectId],
        ref: "user"
    }
},{
    timestamps: true
})

export const ChatRoom = model<IChat, ChatModel>("chat", chatRoom);