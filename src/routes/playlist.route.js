import { Router } from "express";
import {
  addVideoOnplaylist,
  createplaylist,
  deleteplaylist,
  getvideosByPlaylistId,
  getUserPlaylist,
  removeVideoFromplaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/create-playlist").post(verifyJWT, createplaylist);
router
  .route("/add-video/:videoId/:playlistId")
  .patch(verifyJWT, addVideoOnplaylist);
router
  .route("/remove-video/:videoId/:playlistId")
  .patch(verifyJWT, removeVideoFromplaylist);
router.route("/delete-playlist/:playlistId").delete(verifyJWT, deleteplaylist);
router.route("/user-playlists/:userId").get(verifyJWT, getUserPlaylist);
router.route("/videos/:playlistId").get(verifyJWT, getvideosByPlaylistId);

export default router;
