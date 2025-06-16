import { model, Schema } from "mongoose";
import { postInterface } from "./post.interface";


const postSchema = new Schema<postInterface>({
    title: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        required: true,
        min: 40
    },
    amount: {
        type: Number,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    work_time: {
        type: Date,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    images: [
        {
            type: String,
        }
    ],
    location: {
        inText: {
            type: String,
            required: true
        },
        geoFormet: {
            type: {
                type: String,
                required: true,
                enum: ["Point"],
                default: "Point"
            },
            coordinates:{
                type: [Number],
                required: true
            }
        }
    }
},{
    timestamps: true
})

postSchema.index({ location: "2dsphere" });

export const Post = model<postInterface>('post', postSchema);