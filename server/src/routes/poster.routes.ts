import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  createPoster,
  getMyPosters,
  getPosterById,
  regeneratePoster,
} from "../controllers/poster.controller.js";
import { posterGenerationLimiter } from "../middleware/rate-limit.js";

const posterRoutes = Router();
//creating poster
posterRoutes.post("/", authenticate, posterGenerationLimiter, createPoster);
// poster history
posterRoutes.get("/", authenticate, getMyPosters);
// get poster by id
posterRoutes.get("/:id", authenticate, getPosterById);
// Again Generate poster
posterRoutes.post(
  "/:id/regenerate",
  authenticate,
  posterGenerationLimiter,
  regeneratePoster,
);

export default posterRoutes;
