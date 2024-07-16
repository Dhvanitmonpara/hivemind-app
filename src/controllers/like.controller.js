import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video

    const existingLike = await Like.findOne({ videoId, userId: req.user._id })
    if (existingLike) {
        await existingLike.remove()
    } else {
        await Like.create({ videoId, userId: req.user._id })
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            existingLike,
            "Like toggled successfully"
        ))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment

    const existingLike = await Like.findOne({ commentId, userId: req.user._id })
    if (existingLike) {
        await existingLike.remove()
    } else {
        await Like.create({ commentId, userId: req.user._id })
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            existingLike,
            "Like toggled successfully"
        ))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet

    const existingLike = await Like.findOne({ tweetId, userId: req.user._id })
    if (existingLike) {
        await existingLike.remove()
    } else {
        await Like.create({ tweetId, userId: req.user._id })
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            existingLike,
            "Like toggled successfully"
        ))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likes = await Like.find({ 
        userId: req.user._id 
    }).populate(
        "videoId", 
        "title description"
    )

    if (likes.length === 0) {
        throw new ApiError(404, "No liked videos found")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            likes,
            "Like toggled successfully"
        ))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}