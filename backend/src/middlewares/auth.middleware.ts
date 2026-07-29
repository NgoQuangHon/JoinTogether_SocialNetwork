import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt";
import { AuthenticatedUser } from "../types/express";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res
      .status(401)
      .json({ success: false, message: "Không tìm thấy token xác thực." });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn.",
      });
      return;
    }
    req.user = decoded as AuthenticatedUser;
    next();
  });
};
