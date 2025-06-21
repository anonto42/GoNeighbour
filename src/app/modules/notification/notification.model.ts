import { model, Schema } from "mongoose";
import { notificationI } from "./notification.interface";

const notificationSchema = new Schema<notificationI>({
    from: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    for: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    content: {
        type: String
    },
    discription: {
        type: String
    },
    title: {
        type: String,
        required: true
    }
},{
    timestamps: true
});

export const NotificationModel = model<notificationI>("notification",notificationSchema)