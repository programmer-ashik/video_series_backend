import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CODE_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // remove file from local file after uploading in cloudinary
    fs.unlinkSync(localFilePath);
    // file has been uploaded successfully
    return response;
  } catch (error) {
    //remve the locally saved file as the upload operations faild
    fs.unlinkSync(localFilePath);
    return null;
  }
};
export { uploadOnCloudinary };
