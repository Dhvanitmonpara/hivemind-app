import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Channel } from "../models/channel.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription

    if (!channelId) {
        throw new ApiError(400, "Channel ID is required")
    }

    const user = await User.findById(req.user.id)

    if (!user) {
        throw new ApiError(401, "User not found")
    }

    const channel = await Channel.findById(channelId)

    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    const isSubscribed = await Subscription.findOne({
        user: user._id,
        channel: channel._id
    })

    // TODO: check if query works as expected
    if (!isSubscribed) {
        const subscription = new Subscription({
            user: user._id,
            channel: channel._id
        })

        await subscription.save()

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
    const { channelId } = req.params

    if (!channelId) {
        throw new ApiError(400, "Channel ID is required")
    }

    const subscribers = await Subscription.findMany({ channel: channelId })

    if (!subscribers) {
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
    const { subscriberId } = req.params

    if (!subscriberId) {
        throw new ApiError(400, "Subscriber ID is required")
    }

    const user = await User.findById(subscriberId)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const subscriptions = await Subscription.findMany({ subscriber: subscriberId })

    if(!subscriptions || subscriptions.length === 0) {
        throw new ApiError(404, "No subscriptions found")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            subscriptions,
            "Subscribed channels fetched successfully"
        ))

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}