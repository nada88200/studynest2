import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing
  },
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadResults = await Promise.all(
      files.map(async (file) => {
        // Ensure the file is a Blob-like object
        if (!(file instanceof Blob)) {
          throw new Error('Invalid file type: Expected a Blob or File object.');
        }

        // Read the file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Determine file type (same logic as before)
        let type;
        if (file.type) {
          if (file.type.startsWith('image/')) {
            type = 'photo';
          } else if (file.type === 'application/pdf') {
            type = 'pdf';
          } else if (file.type.startsWith('video/')) {
            type = 'video';
          } else {
            type = 'other';
          }
        } else {
          // Fallback for when file.type is not available
          const fileName = file.name || 'file';
          const extension = fileName.split('.').pop().toLowerCase();
          if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
            type = 'photo';
          } else if (extension === 'pdf') {
            type = 'pdf';
          } else if (['mp4', 'mov', 'avi'].includes(extension)) {
            type = 'video';
          } else {
            type = 'other';
          }
        }

        // Upload to Cloudinary
        const result = await uploadToCloudinary(buffer, {
          resource_type: type === 'video' ? 'video' : 'auto',
          folder: 'course-materials'
        });

        return {
          type,
          url: result.url
        };
      })
    );

    return NextResponse.json(uploadResults);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload files' },
      { status: 500 }
    );
  }
}