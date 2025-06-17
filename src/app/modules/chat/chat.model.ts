import { model, Schema } from "mongoose";
import { ChatModel, IChat } from "./chat.interface";


const chatRoom = new Schema<IChat, ChatModel>({
    name: {
        type: String,
        required: true
    },
    participants:{
        type: [String],
        required: true
    }
},{
    timestamps: true
})

export const ChatRoom = model<IChat, ChatModel>("/chat", chatRoom);