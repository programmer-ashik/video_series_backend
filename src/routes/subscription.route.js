import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggledSubscription,
} from "../controllers/subscription.controller.js";

const router = Router();
router.route("/subscribe/:channelId").post(verifyJWT, toggledSubscription);
router
  .route("/subscriber/:channelId")
  .get(verifyJWT, getUserChannelSubscribers);
router.route("/subscribed/:subscriberId").get(verifyJWT, getSubscribedChannels);

export default router;
