import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { signupSchema, loginSchema } from "../schemas/auth.schema";
import { ApiResponse } from "../utils/api-response";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

// Helper to exclude password from user object
function excludePassword(user: { password: string; [key: string]: unknown }) {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Set auth cookie
function setAuthCookie(res: Response, token: string) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
  });
}

// POST /api/auth/signup
export async function signup(req: Request, res: Response) {
  try {
    const body = signupSchema.safeParse(req.body);
    if (!body.success) {
      return ApiResponse.validationError(res, body.error);
    }

    const { email, name, password } = body.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return ApiResponse.conflict(res, "Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    // Generate JWT and set cookie
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    setAuthCookie(res, token);

    ApiResponse.success(
      res,
      StatusCodes.CREATED,
      { user: excludePassword(user) },
      "Account created successfully"
    );
  } catch (error) {
    console.error("Error during signup:", error);
    ApiResponse.internalError(res, "Failed to create account");
  }
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  try {
    const body = loginSchema.safeParse(req.body);
    if (!body.success) {
      return ApiResponse.validationError(res, body.error);
    }

    const { email, password } = body.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return ApiResponse.unauthorized(res, "Invalid email or password");
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return ApiResponse.unauthorized(res, "Invalid email or password");
    }

    // Generate JWT and set cookie
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    setAuthCookie(res, token);

    ApiResponse.success(res, StatusCodes.OK, { user: excludePassword(user) });
  } catch (error) {
    console.error("Error during login:", error);
    ApiResponse.internalError(res, "Failed to login");
  }
}

// POST /api/auth/logout
export async function logout(req: Request, res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  ApiResponse.success(res, StatusCodes.OK, null, "Logged out successfully");
}

// GET /api/auth/me - Get current user
export async function me(req: Request, res: Response) {
  try {
    // req.userId is set by auth middleware
    const userId = (req as Request & { userId: number }).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return ApiResponse.notFound(res, "User not found");
    }

    ApiResponse.success(res, StatusCodes.OK, excludePassword(user));
  } catch (error) {
    console.error("Error fetching user:", error);
    ApiResponse.internalError(res, "Failed to fetch user");
  }
}
