import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  createPoster,
  getPosterById,
} from "../controllers/poster.controller.js";

const posterRoutes = Router();
// verify before creating poster
posterRoutes.post("/", authenticate, createPoster);
posterRoutes.get("/:id", authenticate, getPosterById);

export default posterRoutes;
