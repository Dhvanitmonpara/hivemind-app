import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/channels/:channelId")
    .get(getSubscribedChannels)
    .post(toggleSubscription);

router.route("/users/:subscriberId").get(getUserChannelSubscribers);

export default router