import { Router } from "express";
import {
  getVideoComments,
  addComments,
  updateComments,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = Router();
router.route("/add/comment").post(addComments);
router.route("/video/comments/:videoId").get(getVideoComments);
router.route("/delete/comment/:commentId").delete(deleteComment);
router.route("/update/comment/:commentId").patch(updateComments);
export default router;
