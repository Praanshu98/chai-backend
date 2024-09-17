import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfully
    //console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

const deleteOnCloudinary = async (cloudinaryUrl, resource_type = "image") => {
  try {
    if (!cloudinaryUrl) return new ApiError(400, "Cloudinary url is required");

    const publicId = cloudinaryUrl.split("/").pop().split(".")[0];

    // delete the file on cloudinary
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type,
    });

    // file has been deleted successfully
    return response;
  } catch (error) {
    return new ApiError(
      500,
      error || "Something went wrong while deleting file"
    );
  }
};

export { uploadOnCloudinary, deleteOnCloudinary };
