import mongoose, { isValidObjectId, Schema } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // // TODO: get video, upload to cloudinary, create video

  // Check for empty details of video or thumbnail
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Upload thumbnail and video to server local storage
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  const videoLocalPath = req.files?.videoFile[0]?.path;

  // Check thumbnail and video both were uploaded
  if (!(thumbnailLocalPath || videoLocalPath))
    throw new ApiError(400, "Video and thumbnail both are required.");

  const thumbnailCloudinary = await uploadOnCloudinary(thumbnailLocalPath);
  const videoCloudinary = await uploadOnCloudinary(videoLocalPath);

  if (!(thumbnailCloudinary || videoCloudinary))
    throw new ApiError(
      500,
      "Error while uploading thumbnail or video to cloudinary"
    );

  // Video object
  const createdVideo = Video.create({
    videoFile: videoCloudinary.secure_url,
    thumbnail: thumbnailCloudinary.secure_url,
    title,
    description,
    duration: Math.round(videoCloudinary.duration, 0),
    owner: req.user._id,
  });

  if (!createdVideo) {
    throw new ApiError(500, "Something went wrong while creating video");
  }

  res
    .status(200)
    .json(new ApiResponse(200, createdVideo, "Video created successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // // TODO: get video by id

  // Check if video exists
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);

  // Check if video exists
  if (!video) {
    throw new ApiError(404, "Video does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // // TODO: update video details like title, description, thumbnail

  // Check if videoId is valid
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const { title, description } = req.body;

  // Check if title, description, and videoId are empty
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const thumbnailLocalPath = req.file?.path;

  // Check if thumbnail is empty
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail file is required");
  }

  // Upload to cloudinary
  const thumbnailCloudinary = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnailCloudinary.secure_url) {
    throw new ApiError(400, "Error while uploading thumbnail to cloudinary");
  }

  // Update video
  const updatedVideo = await Video.findOneAndUpdate(
    new mongoose.Types.ObjectId(videoId),
    {
      $set: {
        title,
        description,
        thumbnail: thumbnailCloudinary.secure_url,
      },
    },
    { new: true }
  );

  if (!updatedVideo) {
    throw new ApiError(500, "Something went wrong while updating video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // // TODO: delete video

  // Check if videoId is valid
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  // Get video details
  const video = await Video.findById(videoId);

  // Check if video exists
  if (!video) {
    throw new ApiError(404, "Video does not exist");
  }

  console.log(video);

  // Delete thumbnail and video from cloudinary
  await deleteOnCloudinary(video.thumbnail);
  await deleteOnCloudinary(video.videoFile, "video");

  // Delete video
  const deletedVideo = await Video.findByIdAndDelete(videoId);

  console.log(deletedVideo);

  if (!deletedVideo) {
    throw new ApiError(500, "Something went wrong while deleting video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
