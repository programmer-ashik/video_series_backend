import { Router } from "express";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.route("/like_video/:videoId").post(verifyJWT, toggleVideoLike);
router.route("/like_comment/:commentId").post(verifyJWT, toggleCommentLike);
router.route("/liked_videos").get(verifyJWT, getLikedVideos);
export default router;
