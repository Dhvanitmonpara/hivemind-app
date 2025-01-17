import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // toggle like on video

    const existingLike = await Like.findOne({ video: videoId, likedBy: req.user._id })
    if (existingLike) {
        await Like.deleteOne(existingLike._id)
    } else {
        await Like.create({ video: videoId, likedBy: req.user._id })
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
    // toggle like on comment

    const existingLike = await Like.findOne({ comment: commentId, likedBy: req.user._id })

    if (existingLike) {

        await Like.deleteOne(existingLike._id)

    } else {

        await Like.create({
            comment: commentId,
            likedBy: req.user._id,
        })

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
    // toggle like on tweet

    const existingLike = await Like.findOne({ tweet: tweetId, likedBy: req.user._id })
    if (existingLike) {
        await Like.deleteOne(existingLike._id)
    } else {
        await Like.create({ tweet: tweetId, likedBy: req.user._id })
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
    // get all liked videos

    const likes = await Like.find({
        likedBy: req.user._id
    }).populate(
        "video",
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