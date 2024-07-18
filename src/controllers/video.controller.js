import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    const { file } = req.files
    // get video, upload to cloudinary, create video

    if (!title || !description) {
        throw new ApiError("Title and description are required", 400)
    }

    const thumbnailUrl = await uploadOnCloudinary(req.file.path) // TODO: set proper file path

    if (!thumbnailUrl) {
        throw new ApiError(500, "Failed to upload thumbnail")
    }

    const videoUrl = await uploadOnCloudinary(req.file.path) // TODO: set proper file path

    if (!videoUrl) {
        throw new ApiError(500, "Failed to upload video")
    }

    const video = await Video.create({
        title,
        description,
        owner: req.user._id,
        // duration: 
        thumbnail: thumbnailUrl,
        videoFile: videoUrl,
        views: 0,
        isPublished: false,
    })

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
