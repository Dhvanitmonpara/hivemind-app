import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // get video, upload to cloudinary, create video

    if (!title || !description) {
        throw new ApiError("Title and description are required", 400)
    }

    const thumbnailLocalPath = req.files?.thumbnail?.[0].path
    const videoLocalPath = req.files?.videoFile?.[0].path

    if(!thumbnailLocalPath || !videoLocalPath) {
        throw new ApiError(400, "Thumbnail and Video files are required")
    }

    const thumbnailOnCloudinary = await uploadOnCloudinary(thumbnailLocalPath)

    if (!thumbnailOnCloudinary) {
        throw new ApiError(500, "Failed to upload thumbnail")
    }

    const videoOnCloudinary = await uploadOnCloudinary(videoLocalPath)

    if (!videoOnCloudinary) {
        throw new ApiError(500, "Failed to upload video")
    }

    const video = await Video.create({
        title,
        description,
        owner: req.user._id,
        duration: videoOnCloudinary?.duration,
        thumbnail: thumbnailOnCloudinary?.url,
        videoFile: videoOnCloudinary?.url,
        views: 0,
        isPublished: false,
    })

    if(!video){
        throw new ApiError(500, "Failed to create video")
    }

    return res 
        .status(200)
        .json(new ApiResponse(
            200,
            video,
            "Video published successfully"
        ))

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

    if(!videoId){
        throw new ApiError(400, "Video ID is required")
    }

    console.log(videoId)

    const response = await deleteFromCloudinary(videoId)

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            response,
            "Video deleted successfully"
        ))

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
