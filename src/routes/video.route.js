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
router.route("/upload-video").post(
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishVideo
);
router.route("/get-all-videos").get(getAllVideos);
router.route("/get-video/:videoId").get(getVideoById);
router.route("/update-video/:videoId").patch(
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  updateVideo
);
router.route("/delete-video/:videoId").delete(verifyJWT, deleteVideo);
router
  .route("/toggle-publish-status/:videoId")
  .patch(verifyJWT, toggledPublishStatus);
export default router;
