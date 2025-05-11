// export default cloudinary;
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
export default cloudinary;

// Add this to your existing cloudinary.js
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    // You might want to handle this differently in production
  }
};
export const uploadToCloudinary = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto",
          folder: "course_files",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(new Error("Failed to upload file to Cloudinary"));
          } else {
            resolve({
              url: result.secure_url,
              type: result.resource_type === "image" ? "photo" : 
                   result.resource_type === "video" ? "video" : "pdf"
            });
          }
        }
      )
      .end(buffer);
  });
};
