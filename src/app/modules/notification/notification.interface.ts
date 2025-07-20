import { Document, Types } from "mongoose";

export interface notificationI {
    from: Types.ObjectId;
    title: string;
    discription: string;
    for: Types.ObjectId;
}