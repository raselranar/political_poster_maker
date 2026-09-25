import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { uploadBufferToCloudinary } from "../services/cloudinary.service.js";

export const uploadPhotos = async (req: AuthRequest, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

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
      files.map((file) =>
        uploadBufferToCloudinary(
          file.buffer,
          "ai-political-poster-maker/uploads",
        ),
      ),
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
