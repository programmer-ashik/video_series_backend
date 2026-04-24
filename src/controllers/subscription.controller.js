import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const toggledSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user?._id;
  //   no check already have subscription have on this channel or not
  const credentials = { subscriber: userId, channel: channelId };
  const subcribed = await Subscription.findOne(credentials);
  if (channelId.toString() === userId.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }
  if (subcribed) {
    await Subscription.findByIdAndDelete(subcribed._id);
    return res.status(200).json(new ApiResponse(200, { isSubcribed: false }));
  }
  await Subscription.create(credentials);
  return res
    .status(200)
    .json(
      new ApiResponse(200, { isSubscribed: true }, "Subscribed successfully")
    );
});
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel Id");
  }
  const subscribers = await Subscription.aggregate([
    {
      $match: { channel: new mongoose.Types.ObjectId(channelId) },
    },
    // find user from User collenction
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscriberDetails: { $first: "$subscriberDetails" },
      },
    },
  ]);
  const totalSuubscriber = subscribers?.length || 0;
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribers, totalSuubscriber },
        "Subscribers fetched successfully"
      )
    );
});
const getSubscribedChannel = asyncHandler(async (req, res) => {
  const { subdcriberId } = req.params;
  if (!isValidObjectId(subdcriberId)) {
    throw new ApiError(400, "Invalid Subscriber Id");
  }
  const subscribedChannel = await Subscription.aggregate([
    {
      $match: { subscriber: new mongoose.Types.ObjectId(subdcriberId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedChannel",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: { subscribedChannel: { $first: "$subscribedChannel" } },
      //   object from array
      //   $unwind: "subscribedChannel",
    },
    {
      $project: {
        subscribedChannel: 1,
        createdAt: 1,
      },
    },
  ]);
  const totalSubscribedChannel = subscribedChannel?.length;
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribedChannel, totalSubscribedChannel },
        "Subscriber Channel fetch Successfully"
      )
    );
});
export { toggledSubscription, getUserChannelSubscribers, getSubscribedChannel };
