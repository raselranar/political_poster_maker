import type { Request, Response } from "express";
import { User } from "../models/User.js";
import { success } from "zod";
import bcrypt from "bcryptjs";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // checking name, email & password is empty or not
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // check user already exists by email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User Already Exists",
      });
    }

    // password hashing
    const passwordHash = await bcrypt.hash(password, 12);

    // create user on database
    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
