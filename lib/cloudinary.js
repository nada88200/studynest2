// export default cloudinary;
// import { v2 as cloudinary } from "cloudinary";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
//   secure: true,
// });
// export default cloudinary;


// export const deleteFromCloudinary = async (publicId) => {
//   try {
//     await cloudinary.uploader.destroy(publicId);
//   } catch (error) {
//     console.error("Error deleting from Cloudinary:", error);
   
//   }
// };
// export const uploadToCloudinary = async (file) => {
//   const arrayBuffer = await file.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);

//   return new Promise((resolve, reject) => {
//     cloudinary.uploader
//       .upload_stream(
//         {
//           resource_type: "auto",
//           folder: "course_files",
//         },
//         (error, result) => {
//           if (error) {
//             console.error("Cloudinary upload error:", error);
//             reject(new Error("Failed to upload file to Cloudinary"));
//           } else {
//             resolve({
//               url: result.secure_url,
//               type: result.resource_type === "image" ? "photo" : 
//                    result.resource_type === "video" ? "video" : "pdf"
//             });
//           }
//         }
//       )
//       .end(buffer);
//   });
// };


// // lib/cloudinary.js
// import { v2 as cloudinary } from "cloudinary";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export default cloudinary;

//lib\cloudinary.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
export default cloudinary;

// Add this to your existing cloudinary.js
// export const deleteFromCloudinary = async (publicId) => {
//   try {
//     await cloudinary.uploader.destroy(publicId);
//   } catch (error) {
//     console.error("Error deleting from Cloudinary:", error);
//     // You might want to handle this differently in production
//   }
// // };
// export const deleteFromCloudinary = async (publicId) => {
//   try {
//     await cloudinary.uploader.destroy(publicId);
//   } catch (error) {
//     console.error("Error deleting from Cloudinary:", error);
//     throw error;
//   }
// };

// export const uploadToCloudinary = async (file) => {
//   const arrayBuffer = await file.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);

//   return new Promise((resolve, reject) => {
//     cloudinary.uploader
//       .upload_stream(
//         {
//           resource_type: "auto",
//           folder: "course_files",
//         },
//         (error, result) => {
//           if (error) {
//             console.error("Cloudinary upload error:", error);
//             reject(new Error("Failed to upload file to Cloudinary"));
//           } else {
//             resolve({
//               url: result.secure_url,
//               type: result.resource_type === "image" ? "photo" : 
//                    result.resource_type === "video" ? "video" : "pdf"
//             });
//           }
//         }
//       )
//       .end(buffer);
//   });
// };

export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};

// export const uploadToCloudinary = async (buffer, options = {}) => {
//   return new Promise((resolve, reject) => {
//     // Convert buffer to base64 string
//     const base64String = buffer.toString('base64');
    
//     // Use uploader.upload instead of upload_stream
//     cloudinary.uploader.upload(
//       `data:${options.resource_type === 'video' ? 'video/mp4' : 'image/png'};base64,${base64String}`,
//       options,
//       (error, result) => {
//         if (error) {
//           console.error("Cloudinary upload error:", error);
//           reject(error);
//         } else {
//           resolve({
//             url: result.secure_url,
//             type: result.resource_type === "image" ? "photo" : 
//                  result.resource_type === "video" ? "video" : "pdf"
//           });
//         }
//       }
//     );
//   });
// };
// lib/cloudinary.js
// export const uploadToCloudinary = async (buffer, options = {}) => {
//   return new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(
//       {
//         resource_type: "auto", // Cloudinary سيتعرف تلقائياً على نوع الملف
//         folder: "course_files",
//         ...options
//       },
//       (error, result) => {
//         if (error) {
//           console.error("Cloudinary upload error:", error);
//           reject(error);
//         } else {
//           resolve({
//             url: result.secure_url,
//             public_id: result.public_id,
//             type: result.resource_type === "image" ? "photo" : 
//                  result.resource_type === "video" ? "video" : "file"
//           });
//         }
//       }
//     );

//     uploadStream.end(buffer);
//   });
// };

export const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        ...options
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            type: result.resource_type === 'image' ? 'photo' : 
                  result.resource_type === 'video' ? 'video' : 'file'
          });
        }
      }
    );
    
    uploadStream.end(buffer);
  });
};