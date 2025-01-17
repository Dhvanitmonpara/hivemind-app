import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // toggle subscription

    if (!channelId) {
        throw new ApiError(400, "Channel ID is required")
    }

    const isSubscribed = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    if (!isSubscribed) {
        const subscription = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId,
        })

        return res.status(201).json(new ApiResponse(
            200,
            subscription,
            "Subscription created successfully"
        ))
    } else {
        const subscribed = await Subscription.findByIdAndDelete(isSubscribed._id)

        if (!subscribed) {
            throw new ApiError(500, "Failed to unsubscribe")
        }

        return res.status(200).json(new ApiResponse(
            200,
            null,
            "Subscription deleted successfully"
        ))
    }

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!subscriberId) {
        throw new ApiError(400, "Channel ID is required")
    }

    const subscribers = await Subscription.find({ subscriber: subscriberId })

    if (!subscribers || subscribers.length === 0) {
        throw new ApiError(404, "No subscribers found")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            subscribers,
            "Subscribed users fetched successfully"
        ))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    
    if (!channelId) {
        throw new ApiError(400, "Channel ID is required")
    }

    const channels = await Subscription.find({ channel: channelId })

    if (!channels || channels.length === 0) {
        throw new ApiError(404, "No subscriptions found")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            channels,
            "Subscribed channels fetched successfully"
        ))

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}