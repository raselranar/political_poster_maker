import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { uploadPhotos } from "../controllers/upload.controller.js";
const uploadRoutes = Router();

uploadRoutes.post("/", authenticate, upload.array("photos", 3), uploadPhotos);

export default uploadRoutes;
