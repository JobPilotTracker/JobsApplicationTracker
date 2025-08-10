import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { sendError } from "../utils/response";
import { logger } from "../config/logger";

const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  // Log the error
  logger.error("Request error", {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    requestId: req.requestId,
  });

  // Handle known application errors
  if (error instanceof AppError) {
    return sendError(res, error, req.requestId);
  }

  // Handle Prisma errors
  if (error.name === "PrismaClientKnownRequestError") {
    const prismaError = error as any;
    let appError: AppError;

    switch (prismaError.code) {
      case "P2002":
        appError = new AppError(
          "Resource already exists",
          409,
          "DUPLICATE_ERROR"
        );
        break;
      case "P2025":
        appError = new AppError("Resource not found", 404, "NOT_FOUND_ERROR");
        break;
      default:
        appError = new AppError("Database error", 500, "DATABASE_ERROR");
    }

    return sendError(res, appError, req.requestId);
  }

  // Handle JWT errors
  if (error.name === "JsonWebTokenError") {
    const appError = new AppError("Invalid token", 401, "INVALID_TOKEN");
    return sendError(res, appError, req.requestId);
  }

  if (error.name === "TokenExpiredError") {
    const appError = new AppError("Token expired", 401, "TOKEN_EXPIRED");
    return sendError(res, appError, req.requestId);
  }

  // Handle unexpected errors
  const appError = new AppError(
    "Internal server error",
    500,
    "INTERNAL_ERROR",
    false
  );

  return sendError(res, appError, req.requestId);
};

export default errorHandler;
