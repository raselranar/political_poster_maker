import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
const app = express();
import "dotenv/config";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import templateRoutes from "./routes/template.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import posterRoutes from "./routes/poster.routes.js";
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// routes
app.get("/", (req, res) => {
  res.send({ success: true, message: "server is running" });
});

// auth routes
app.use("/api/auth", authRoutes);

// template routes
app.use("/api/templates", templateRoutes);

// upload routes
app.use("/api/upload", uploadRoutes);

// poster creating routes
app.use("/api/posters", posterRoutes);

// global error handler
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
};

app.use(globalErrorHandler);

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT}; URL: http://localhost:${PORT}`,
    );
  });
};

startServer();
