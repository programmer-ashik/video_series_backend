import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {
  deleteFileFromCloudinary,
  getPublicIdFromUrl,
} from "../utils/deleteFileFromCloudinary.js";
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  const pipelines = [];
  //   query from search
  if (query) {
    pipelines.push({
      $match: {
        $or: [
          { title: { $regex: query, $options: "i" } }, //serch hare for title match
          { description: { $regex: query, $options: "i" } }, // search here for discriptions match
        ],
      },
    });
  }
  //   search by userId
  if (userId) {
    pipelines.push({
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    });
  }
  pipelines.push({
    $sort: {
      [sortBy || "createdAt"]: sortType === "asc" ? 1 : -1,
    },
  });
  const videoAggregate = Video.aggregate(pipelines);
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };
  //   in this aggregatePaginate plugin expected pending object. and this pending object is videoAggregate
  const videoList = await Video.aggregatePaginate(videoAggregate, options);
  return res
    .status(200)
    .json(new ApiResponse(200, videoList, "Get all videos successfully"));
});
const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const videoLocalFilePath = req.files?.videoFile[0]?.path;
  if (!videoLocalFilePath) {
    throw new ApiError(400, "Video localpath is missing");
  }
  const uploadInCloudenery = await uploadOnCloudinary(videoLocalFilePath);
  if (!uploadInCloudenery?.url) {
    throw new ApiError(401, "Missing uploaded video url while uploding");
  }
  const thumbnailLocalpath = req.files?.thumbnail[0].path;
  if (!thumbnailLocalpath) {
    throw new ApiError(402, "Missing Thuumbnail Url");
  }
  const uploadThumbnailCloudinary =
    await uploadOnCloudinary(thumbnailLocalpath);
  if (!uploadThumbnailCloudinary?.url) {
    throw new ApiError(403, "Missing uploaded thumbnail url while uploding");
  }
  const createVideo = await Video.create({
    title,
    description,
    thumbnail: uploadThumbnailCloudinary?.url,
    videoFile: uploadInCloudenery?.url,
    duration: uploadInCloudenery?.duration || 0,
    isPublish: true,
    owner: req.user?._id,
  });
});
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video_id not coming form params");
  }
  const video = await Video.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(videoId) } },
    // take woner details for showing
    {
      $lookup: {
        from: "User",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    // convert arry to object
    {
      $addFields: { owner: { first: "$owner" } },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetch Successfully"));
});
const updateVideo = asyncHandler(async (req, res) => {
  // take videoId from req.params
  // take title and description from req.body
  // thumbnilpath for req.file?.path
  // verifi every thing will not empty
  //   find the video by videoId
  //   set thumbnail with newThumbnial url
  //   update video with new value and findByIdAndUpdate(serchId,{$set:{
  //                                                                       key:value}}) method
  //return response
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;
  if (!videoId) {
    throw new ApiError(404, "Plz fill the require field");
  }
  if (!title && !description) {
    throw new ApiError(404, "Plz fill the require field");
  }
  let updateThumbnail;
  if (thumbnailLocalPath) {
    const newThuumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!newThuumbnail?.url) {
      throw new ApiError(400, "Error during upload thumbnail");
    }
    updateThumbnail = newThuumbnail.url;
  }

  const updateVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title || "Need Title for your video",
        description: description || "Need Title for your video",
        ...(updatedThumbnail && { thumbnail: updatedThumbnail }),
      },
    },
    { new: true }
  );
  if (!updateVideo) {
    throw new ApiError(400, "Video Not Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updateVideo, "Video updated Successfully"));
});
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }
  //   delete thumbnil and  video from cloudinary
  const videoDelete = await deleteFileFromCloudinary(
    getPublicIdFromUrl(video.videoFile),
    "video"
  );
  const thumbnailDelete = await deleteFileFromCloudinary(
    getPublicIdFromUrl(video.thumbnail),
    "image"
  );
  const deleteVideo = await Video.findByIdAndDelete(videoId);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video delete Successfully"));
});
const toggledPublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "VideoId is required for delete");
  }
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    [
      {
        $set: {
          isPublish: { $not: "$isPublish" },
        },
      },
    ],
    { new: true }
  );

  if (!updatedVideo) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Status toggled"));
});
export {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  toggledPublishStatus,
};
/*user
1. get video list, by dynamic query,orderby,limit,page-1 to 10
2.get video by id
3. video create
4. video update
5. video delete
*/
