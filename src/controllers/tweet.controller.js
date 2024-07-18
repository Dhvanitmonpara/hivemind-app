import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    // get data from request body
    // check if tweet text is valid
    // create new tweet in database
    // return response with tweet data

    const { content } = req.body

    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.create({
        owner: new mongoose.Types.ObjectId(req.user?._id),
        content
    })

    return res
        .status(201)
        .json(new ApiResponse(
            200,
            tweet,
            "Tweet created successfully"
        ))

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    // get user id from request user
    // get all tweets where owner id matches user id
    // return response with tweet data

    const { userId } = req.params

    if (!userId) {
        throw new ApiError(400, "User ID is required")
    }

    const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 })

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            tweets,
            "User tweets fetched successfully"
        ))
})

const updateTweet = asyncHandler(async (req, res) => {
    // update tweet

    // get tweet id from request params
    // get data from request body
    // check if tweet text is valid
    // update tweet in database
    // return response with updated tweet data

    const { tweetId } = req.params

    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required")
    }

    const { content } = req.body

    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { content },
        { new: true }
    ).select("-__v")

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    return res
       .status(200)
       .json(new ApiResponse(
            200,
            tweet,
            "Tweet updated successfully"
        ))
})

const deleteTweet = asyncHandler(async (req, res) => {
    // delete tweet
    
    // get tweet id from request params
    // delete tweet from database
    // return response with deleted tweet data

    const { tweetId } = req.params

    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required")
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    return res
       .status(200)
       .json(new ApiResponse(
            200,
            tweet,
            "Tweet deleted successfully"
        ))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
