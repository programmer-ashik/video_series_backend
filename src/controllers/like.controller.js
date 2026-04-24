import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/like.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }
  const alreadyLiked = await Like.findById({
    video: videoId,
    likeBy: userId,
  });
  if (alreadyLiked) {
    await Like.findByIdAndDelete(alreadyLiked._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: false }, "Like Remove Successfully")
      );
  }
  await Like.create({
    video: videoId,
    likeBy: userId,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked: true }, "Like added successfully"));
});
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const likedBy = req.user?._id;
  const alreadyCommentLiked = await Like.findById({
    comment: commentId,
    likeBy: userId,
  });
  if (alreadyCommentLiked) {
    await Like.findByIdAndDelete(alreadyCommentLiked._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: false }, "Like removw successfully")
      );
  }
  await Like.create({
    comment: commentId,
    likeBy: userId,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked: true }, "Like added successfully"));
});
const getLikedVideo = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const likedVideo = await Like.aggregate([
    {
      $match: {
        likeBy: new mongoose.Types.ObjectId(userId),
        video: { $exists: true, $ne: null },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videosDetails",
        pipeline: [
          {
            $project: {
              videoFile: 1,
              thumbnail: 1,
              title: 1,
              duration: 1,
              views: 1,
              owner: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: { videosDetails: { $first: "$videosDetails" } },
    },
    {
      $match: {
        videosDetails: { $ne: null },
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideo, "All like video fetching Successfully")
    );
});

export { toggleVideoLike, toggleCommentLike, getLikedVideo };
