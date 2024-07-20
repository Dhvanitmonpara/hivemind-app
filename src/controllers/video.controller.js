import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"
import getPublicId from "../utils/getPublicId.js"


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
    const user = req.user
    // get video by id

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    const videoDetails = await Video.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner._id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
            },
        },
        {
            $addFields: {
                owner: { $arrayElemAt: ["$owner", 0] },
                likesCount: { $size: { $ifNull: ["$likes", []] } },
                subscribersCount: { $size: { $ifNull: ["$subscribers", []] } },
                isSubscribed: {
                    $cond: {
                        if: { $in: [user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    },
                },
                isLiked: {
                    $cond: {
                        if: { $in: [user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                videoFile: 1,
                owner: {
                    _id: 1,
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                },
                isSubscribed: 1,
                isLiked: 1,
                likesCount: 1,
                subscribersCount: 1,
                createdAt: 1,
                views: 1,
                isPublished: 1,
                duration: 1,
            },
        },
    ]);

    if (videoDetails.length === 0) {
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            videoDetails[0],
            "Video retrieved successfully"
        ));
})

const updateVideo = asyncHandler(async (req, res) => {

    // FIXME: thumbnail is not updating

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
    // delete video

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    const deletedVideo = await Video.findByIdAndDelete({ _id: videoId, owner: req.user?._id })

    if (!deletedVideo || !deletedVideo.videoFile) {
        throw new ApiError(404, "Video not found")
    }

    const deletedVideoId = getPublicId(deletedVideo.videoFile)

    if (!deletedVideoId) {
        throw new ApiError(500, "Failed to retrieve video Id")
    }

    const videoResponse = await deleteFromCloudinary(deletedVideoId, "video")

    const deletedThumbnailId = getPublicId(deletedVideo.thumbnail)

    if (!deletedThumbnailId) {
        throw new ApiError(500, "Failed to retrieve thumbnail Id")
    }

    const thumbnailResponse = await deleteFromCloudinary(deletedThumbnailId, "image")

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {
                videoResponse,
                thumbnailResponse
            },
            "Video deleted successfully"
        ))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    const authenticatedId = req.user?._id;

    const video = await Video.findByIdAndUpdate(
        {
            _id: videoId,
            owner: authenticatedId
        },
        {
            isPublished: !req.body.isPublished
        },
        { new: true }
    );

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
