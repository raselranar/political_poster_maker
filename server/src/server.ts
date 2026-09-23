import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.get("/api", (req, res) => {
  res.send({ success: true, message: "server is running" });
});

// global error handler
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
};

app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
