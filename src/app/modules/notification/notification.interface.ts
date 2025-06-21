import { Document, Types } from "mongoose";

export interface notificationI {
    from: Types.ObjectId;
    title: string;
    content: string;
    discription: string;
    for: Types.ObjectId;
}