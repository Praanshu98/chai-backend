import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet

  const { content } = req.body;

  // Check if content is empty
  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }

  // Create tweet
  const createdTweet = await Tweet.create({
    content,
    owner: req.user._id,
  });

  if (!createdTweet) {
    throw new ApiError(500, "Something went wrong while creating tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdTweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
