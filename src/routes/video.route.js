import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  toggledPublishStatus,
} from "../controllers/video.controller.js";

const router = Router();
router.route("/upload").post(
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishVideo
);
router.route("/").get(getAllVideos);
router.route("/v/:videoId").get(getVideoById);
router
  .route("/u/v/:videoId")
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo);
router.route("/d/v/:videoId").delete(verifyJWT, deleteVideo);
router.route("/toggle/publish/:videoId").patch(verifyJWT, toggledPublishStatus);
export default router;
