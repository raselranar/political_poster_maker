import type { Request, Response } from "express";
import { Template, type OccasionType } from "../models/Template.js";

export const getTemplates = async (req: Request, res: Response) => {
  try {
    const { occasion } = req.query;

    const query: { isActive: boolean; occasionType?: OccasionType } = {
      isActive: true,
    };
    // if occasion available add to query
    if (occasion) {
      query.occasionType = occasion as OccasionType;
    }

    const templates = await Template.find(query).sort({
      createdAt: -1,
    });
    return res.status(200).json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch templates",
    });
  }
};

// get template by id
export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    // find the active template using id form database
    const template = await Template.findOne({
      _id: id,
      isActive: true,
    });

    // check template empty or not
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    return res.status(200).json({
      success: true,
      template,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch template",
    });
  }
};
