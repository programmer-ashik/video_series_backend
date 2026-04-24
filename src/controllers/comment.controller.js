import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comments.models.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invilide user Id");
  }
  const videoComment = Comment.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(videoId) },
    },
    {
      $lookup: {
        from: "user",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
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
      $addFields: { owner: { $first: "$owner" } },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);
  if (!videoComment) {
    throw new ApiError(400, "Comments not found in Video");
  }
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };
  const commentList = await Comment.aggregatePaginate(videoComment, options);
  if (!commentList || commentList.totalDocs === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No comments found"));
  }
  //   pagenations
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        commentList,
        "All comments for this video fetching successfully"
      )
    );
});
const addComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { text_comment } = req.body;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }
  if (!text_comment || text_comment.trim() === "") {
    throw new ApiError(400, "Require text for comment");
  }
  const comment = await Comment.create({
    content: text_comment.trim(),
    video: videoId,
    owner: req.user?._id,
  });
  if (!comment) {
    throw new ApiError(400, "Plz send a valid comments");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, comment, "comment added successfully"));
});
const updateComments = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { new_comment } = req.body;
  if (!commentId) {
    throw new ApiError(400, "Invalid CommentId");
  }
  if (!new_comment || new_comment.trim() === "") {
    throw new ApiError(400, "Require a valid text for comments");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }
  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to edit this comment");
  }
  comment.content = new_comment;
  const updatedComment = await comment.save();
  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment update Successfully"));
});
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Comment id");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(401, "comment not found");
  }
  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not Authorize for deleting this commnet");
  }
  await Comment.findByIdAndDelete(commentId);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment Deleted Successfully"));
});

export { getVideoComments, addComments, updateComments, deleteComment };
