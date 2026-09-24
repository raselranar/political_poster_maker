import type { Request, Response } from "express";
import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (
  buffer: Buffer,
): Promise<{ secure_url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ai-political-poster-maker",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary upload failed"));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

export const uploadPhotos = async (req: Request, res: Response) => {
  try {
    const files = (req as Request & { files?: Array<{ buffer: Buffer }> }).files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image",
      });
    }

    if (files.length > 3) {
      return res.status(400).json({
        success: false,
        message: "You can upload a maximum of 3 images",
      });
    }

    const uploadedFiles = await Promise.all(
      files.map((file) => uploadToCloudinary(file.buffer)),
    );

    return res.status(201).json({
      success: true,
      images: uploadedFiles,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
};
