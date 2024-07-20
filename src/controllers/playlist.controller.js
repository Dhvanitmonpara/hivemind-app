import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    // create playlist

    if (!name || !description) {
        throw new ApiError(400, "Name and description are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        videos: [],
        owner: new mongoose.Types.ObjectId(req.user?._id)
    })


    if (!playlist) {
        throw new ApiError(500, "Failed to create playlist")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            playlist,
            "Playlist created successfully"
        ))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    // get user playlists
    // get all playlists where owner id matches user id
    // return response with playlist data

    const playlists = await Playlist.find({ owner: userId })

    if (!playlists || !playlists.length) {
        throw new ApiError(404, "No playlists found for this user")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            playlists,
            "User playlists fetched successfully"
        ))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // get playlist by id

    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            playlist,
            "Playlist fetched successfully"
        ))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist ID and Video ID are required")
    }

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId, {
        $push: { videos: videoId }
    }, { new: true })

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            playlist,
            "Video added to playlist successfully"
        ))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // remove video from playlist

    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist ID and Video ID are required")
    }

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId, {
        $pull: { videos: videoId }
    }, { new: true })

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            playlist,
            "Video removed from playlist successfully"
        ))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // delete playlist

    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            playlist,
            "Playlist deleted successfully"
        ))

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    // update playlist

    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }

    if (!name || !description) {
        throw new ApiError(400, "Name and description are required")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId, {
        name,
        description
    })

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            playlist,
            "Playlist updated successfully"
        ))

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
