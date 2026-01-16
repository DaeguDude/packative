import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/api-response";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface AuthRequest extends Request {
  userId: number;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) {
    return ApiResponse.unauthorized(res, "Not authenticated");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    (req as AuthRequest).userId = decoded.userId;
    next();
  } catch (error) {
    return ApiResponse.unauthorized(res, "Invalid token");
  }
}
