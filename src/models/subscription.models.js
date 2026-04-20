import mongoose, { Schema, model } from "mongoose";
const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, // on who subcribe
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId, // on who subcribe
      ref: "User",
    },
  },
  { timestamps: true }
);
export const Subscription = model("Subscription", subscriptionSchema);
