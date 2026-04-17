import mongoose, { Schema, model } from "mongoose";
const videoSchema = new Schema(
  {
    videoFile: {
      type: String, // cloudinery url
      required: true,
    },
    thumbnail: {
      type: String, // cludenery url
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    publish: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
export const Video = model("Video", videoSchema);
