import { Router } from "express";
import {
  getTemplateById,
  getTemplates,
} from "../controllers/template.controller.js";

const templateRoutes = Router();

templateRoutes.get("/", getTemplates);
templateRoutes.get("/:id", getTemplateById);

export default templateRoutes;
