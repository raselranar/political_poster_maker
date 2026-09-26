import rateLimit from "express-rate-limit";

export const posterGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many poster generation requests. Please try again later.",
  },
});
