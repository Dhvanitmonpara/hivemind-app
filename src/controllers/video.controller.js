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

    const validSortFields = ["createdAt", "title"];
    const validSortTypes = ["asc", "desc"];

    if (sortBy && !validSortFields.includes(sortBy)) {
        throw new ApiError(400, "Invalid sort field")
    }

    if (sortType && !validSortTypes.includes(sortType)) {
        throw new ApiError(400, "Invalid sort type")
    }

    if (userId && !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }


    const queryObj = query
        ? {
            title: {
                $regex: new RegExp(
                    query
                        .replace(/[-\/\\^$*+?.()|[\]{}]/g, " ")
                        .split(" ")
                        .join("|"),
                    "i"
                ),
            },
        }
        : {};

    const videos = await Video
        .find(queryObj)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate("owner", "fullname username  avatar coverImage");

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            videos,
            "Videos retrieved successfully"
        ));

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // get video, upload to cloudinary, create video

    if (!title || !description) {
        throw new ApiError("Title and description are required", 400)
    }

    const thumbnailLocalPath = req.files?.thumbnail?.[0].path
    const videoLocalPath = req.files?.videoFile?.[0].path

    if (!thumbnailLocalPath || !videoLocalPath) {
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

    if (!video) {
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
    // get video by id

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            video,
            "Video retrieved successfully"
        ))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const { thumbnail, title, description } = req.body

    let updatedVideo

    if (thumbnail) {

        const thumbnailOldPath = await Video.findById(videoId).select("thumbnail").lean()

        if (thumbnailOldPath?.thumbnail) {
            await deleteFromCloudinary(thumbnailOldPath.thumbnail)
        }

        const thumbnailLocalPath = req.files?.thumbnail?.[0].path

        const thumbnailOnCloudinary = await uploadOnCloudinary(thumbnailLocalPath)

        if (!thumbnailOnCloudinary) {
            throw new ApiError(500, "Failed to upload thumbnail")
        }

        updatedVideo = await Video.findByIdAndUpdate(videoId,
            {
                title,
                description,
                thumbnail: thumbnail?.url,
            },
            { new: true })

    } else {

        updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            {
                title,
                description,
            },
            { new: true })
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedVideo,
            "Video updated successfully"
        ))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!videoId) {
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

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    const video = await Video.findByIdAndUpdate(videoId,
        {
            isPublished: !req.video.isPublished,
        },
        { new: true })

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            video,
            `Video status updated to ${video.isPublished ? "Published" : "Unpublished"}`
        ))

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
