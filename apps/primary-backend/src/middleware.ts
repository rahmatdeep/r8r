import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export function authMiddlware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization as string;

  if (!token) {
    res.status(403).json({
      message: "Unauthorized",
    });
    return;
  } else {
    try {
      const payload = jwt.verify(token, process.env.JWT_PASSWORD as string);
      if (!payload || typeof payload !== "object" || !("id" in payload)) {
        res.status(403).json({
          message: "Unauthorized",
        });
        return;
      }
      req.id = payload.id;
      next();
    } catch (e) {
      res.status(403).json({
        message: "Unauthorized",
      });
      return;
    }
  }
}
