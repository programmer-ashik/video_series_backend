import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.models.js";

const createplaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name?.trim() || !description?.trim()) {
    throw new ApiError(400, "Name and Description required");
  }
  const playlist = await Playlist.create({
    name,
    description,
    video: [],
    owner: req.user?._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist is create for you"));
});
const addVideoOnplaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;
  if (!isValidObjectId(videoId) || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "VideoId and playlistId required");
  }
  const findplaylist = await Playlist.findById(playlistId);
  if (!findplaylist) {
    throw new ApiError(400, "playlist not found");
  }
  if (findplaylist.owner?.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      400,
      "You are not Authorize to add video on this playlist"
    );
  }
  const updateplaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: { videos: videoId }, //avoide to update dublication
    },
    { new: true }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updateplaylist,
        "Video has been added to your playlist Successfully"
      )
    );
});
const removeVideoFromplaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;
  if (!isValidObjectId(videoId) || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Required video or playlist id");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "Playlist not found");
  }
  if (playlist.owner?.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Unauthorize for remove video from playlist");
  }
  const updatePlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatePlaylist,
        "Video has been removed from playlist successfully"
      )
    );
});
const deleteplaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Required playlist id");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  if (playlist.owner?.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      403,
      "Unauthorized! You can only delete your own playlists"
    );
  }
  await playlist.deleteOne();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "playlist remove successfully"));
});
const getUserPlaylist = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "User ID Require");
  }
  const findAllPlaylist = await Playlist.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "playlistVideos",
        pipeline: [
          {
            $project: {
              thumbnail: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        totalVideos: { $size: "$videos" },
        thumbnail: { $arrayElemAt: ["$playlistVideos.thumbnail", 0] },
      }, // for get only one video in playlist
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        thumbnail: 1,
        totalVideos: 1,
        updatedAt: 1,
      },
    },
  ]);
  if (!findAllPlaylist.length) {
    throw new ApiError(404, "playlist not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, findAllPlaylist, "All palylist get successfully")
    );
});
const getvideosByPlaylistId = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "playlistID require");
  }
  const findPlaylist = await Playlist.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(playlistId) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $project: {
              title: 1,
              thumbnail: 1,
              description: 1,
              duration: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        ownerDetails: { $arrayElemAt: ["$ownerDetails", 0] },
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, findPlaylist, "All videos get successfully"));
});
export {
  createplaylist,
  getvideosByPlaylistId,
  getUserPlaylist,
  removeVideoFromplaylist,
  addVideoOnplaylist,
  deleteplaylist,
};
