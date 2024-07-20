import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const channelId = req.user._id

    if (!channelId) {
        throw new ApiError(400, "Channel ID is required")
    }

    const channelStats = await User.aggregate([
        {
            $match: {
                _id: channelId
            }
        },
        {
            $lookup: {
                from: "video",
                localField: "_id",
                foreignField: "owner",
                as: "videos"
            }
        },
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "like",
                localField: "_id",
                foreignField: "likedBy",
                as: "likes"
            }
        },
        {
            $addFields: {
                videosCount: {
                    $size: "$videos"
                },
                subscribersCount: {
                    $size: "$subscribers"
                },
                likesCount: {
                    $size: "$likes"
                }
            }
        }
    ]);

    if (channelStats.length === 0) {
        throw new ApiError(404, "No channel found")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            channelStats,
            "Channel stats fetched successfully"
        ))

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // Get all the videos uploaded by the channel
    const { channelId } = req.params; // because channel is also a user so we can perform task by channelId

    if(!channelId) {
        throw new ApiError(400, "Channel ID is required")
    }

    console.log(channelId)

    const videos = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos"
            }
        }
    ])

    if (videos.length === 0 || !videos[0].videos) {
        throw new ApiError(404, "No videos found for this channel")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            videos[0].videos,
            "Channel videos fetched successfully"
        ))

})

export {
    getChannelStats,
    getChannelVideos
}