import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    // get videoId from request params
    // request comments from database with pagination

    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    // get content from request body
    // check if content is valid
    // create new comment in database
    // update video's comment count
    // return response with comment data

    const { videoId } = req.params
    const { content } = req.body

    if (!content) {
        throw new ApiError(400, "Invalid comment content")
    }

    const newComment = await Comment.create({
        content,
        video: videoId,
        user: req.user._id,
    })

    const video = await Video.findByIdAndUpdate(videoId, {
        $inc: { commentCount: 1 },
    }, { new: true })

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    res.status(201).json(new ApiResponse(
        200,
        newComment,
        "Comment added successfully"
    ))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    // get commentId from request params
    // get content from request body
    // check if content is valid
    // update comment in database

    const { commentId } = req.params
    const { content } = req.body

    if (!content) {
        throw new ApiError(400, "Invalid comment content")
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            content
        },
        {
            new: true
        }
    )

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    res.status(200).json(new ApiResponse(
        200,
        comment,
        "Comment updated successfully"
    ))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    // get commentId from request params
    // delete comment from database
    // update video's comment count

    const { commentId } = req.params

    const comment = await Comment.findByIdAndDelete(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    const video = await Video.findByIdAndUpdate(comment.video, {
        $inc: { commentCount: -1 },
    }, { new: true })

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    res.status(200).json(new ApiResponse(
        200,
        comment,
        "Comment deleted successfully"
    ))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
