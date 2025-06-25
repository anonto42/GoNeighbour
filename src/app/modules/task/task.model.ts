import { model, Schema } from "mongoose";
import { taskI } from "./task.interface";


const taskSchema = new Schema<taskI>({
    customer:{
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    provider:{
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    service:{
        type: Schema.Types.ObjectId,
        ref: "post"
    },
    transactionId:{
        type: String
    },
    isPayed:{
        type: Boolean
    }
},{
    timestamps: true
})

export const Tast = model<taskI>("task", taskSchema);