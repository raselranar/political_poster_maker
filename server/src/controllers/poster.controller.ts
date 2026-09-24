import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { Template } from "../models/Template.js";
import { Poster } from "../models/Poster.js";

export const createPoster = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    // check userId empty or not
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      templateId,
      name,
      designation,
      organization,
      district,
      occasion,
      headline,
      photoUrls,
    } = req.body;

    if (
      !templateId ||
      !name ||
      !district ||
      !occasion ||
      !headline ||
      !Array.isArray(photoUrls)
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // check image url limit
    if (photoUrls.length < 1 || photoUrls.length > 3) {
      return res.status(400).json({
        success: false,
        message: "You must provide between 1 and 3 photos",
      });
    }

    const template = await Template.findOne({
      _id: templateId,
      isActive: true,
    });
    // console.log({ template });
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    const poster = await Poster.create({
      userId,
      templateId,
      formData: {
        name,
        designation,
        organization,
        district,
        occasion,
        headline,
      },
      photoUrls,
      status: "generating",
      regenerationCount: 0,
    });

    return res.status(201).json({
      success: true,
      message: "Poster generation started",
      poster: {
        id: poster._id,
        status: poster.status,
      },
    });
  } catch (error) {
    console.error("Create poster error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create poster",
    });
  }
};
