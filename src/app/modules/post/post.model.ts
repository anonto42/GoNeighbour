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
    lat: {
      type: Number,
      required: true,
    },
    lot: {
      type: Number,
      required: true,
    },
    location: {
       type: { type: String, enum: ['Point'], default: 'Point' },
       coordinates: { type: [Number], required: false },
    },
},{
    timestamps: true
})

postSchema.pre('save', function (next) {
  if (this.lat && this.lot) {
    this.location = {
      type: 'Point',
      coordinates: [this.lat, this.lot],
    };
  }
  next();
});

postSchema.index({ "location": "2dsphere" });

export const Post = model<postInterface>('post', postSchema);