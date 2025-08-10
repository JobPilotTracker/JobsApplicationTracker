import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

// Simple in-memory rate limiter
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> =
    new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Clean up expired entries every minute
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.requests.entries()) {
        if (now > value.resetTime) {
          this.requests.delete(key);
        }
      }
    }, 60 * 1000);
  }

  public middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const key = req.ip || "unknown";
      const now = Date.now();

      let requestData = this.requests.get(key);

      if (!requestData || now > requestData.resetTime) {
        requestData = {
          count: 1,
          resetTime: now + this.windowMs,
        };
        this.requests.set(key, requestData);
        return next();
      }

      if (requestData.count >= this.maxRequests) {
        const resetTime = Math.ceil((requestData.resetTime - now) / 1000);
        res.setHeader("X-RateLimit-Limit", this.maxRequests);
        res.setHeader("X-RateLimit-Remaining", 0);
        res.setHeader("X-RateLimit-Reset", resetTime);

        const error = new AppError(
          "Too many requests, please try again later",
          429,
          "RATE_LIMIT_EXCEEDED"
        );
        return next(error);
      }

      requestData.count++;
      this.requests.set(key, requestData);

      res.setHeader("X-RateLimit-Limit", this.maxRequests);
      res.setHeader(
        "X-RateLimit-Remaining",
        this.maxRequests - requestData.count
      );
      res.setHeader(
        "X-RateLimit-Reset",
        Math.ceil((requestData.resetTime - now) / 1000)
      );

      next();
    };
  }
}

const rateLimiter = new RateLimiter();
export default rateLimiter.middleware();
