import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { createPoster } from "../controllers/poster.controller.js";

const posterRoutes = Router();
// verify before creating poster
posterRoutes.post("/", authenticate, createPoster);

export default posterRoutes;
