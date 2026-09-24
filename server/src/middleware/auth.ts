import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: "user" | "admin";
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    // check authHeader does has Bearer token
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // get only the  token
    const token = authHeader.split(" ")[1] as string;
    // decode the jwt token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      role: "user" | "admin";
    };
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
