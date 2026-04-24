import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "./ApiError.js";
const deleteFileFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    if (!publicId) return null;
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    if (response.result === "ok") {
      console.log(`File deleted successfully: ${publicId}`);
    } else {
      console.log(`Failed to delete or file not found: ${publicId}`);
    }

    return response;
  } catch (error) {
    throw new ApiError(400, "File nor deleting from Cloudinary");
  }
};
const getPublicIdFromUrl = (url) => {
  return url.split("/").pop().split(".")[0];
};
export { deleteFileFromCloudinary, getPublicIdFromUrl };
