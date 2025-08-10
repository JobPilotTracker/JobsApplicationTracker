import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import monitor from "express-status-monitor";

import { env, isDevelopment } from "./config/environment";
import { logger, morganStream } from "./config/logger";
import { errorHandler, requestId, rateLimiter, notFound } from "./middleware";

// Import telemetry (must be imported before other modules)
import "./config/telemetry";

const app = express();

// Trust proxy for accurate IP addresses
app.set("trust proxy", 1);

// Status monitoring (only in development)
if (isDevelopment) {
  app.use(
    monitor({
      title: "Job Tracker API Status",
      path: "/status",
      healthChecks: [
        {
          protocol: "http",
          host: "localhost",
          port: env.PORT,
          path: "/health",
        },
      ],
    })
  );
}

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
  })
);

// Request parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request ID middleware
app.use(requestId);

// HTTP request logging
app.use(
  morgan(
    isDevelopment
      ? "dev"
      : ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
    { stream: morganStream }
  )
);

// Rate limiting
app.use(rateLimiter);

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Import database here to avoid circular dependency
    const { DatabaseConnection } = await import("./config/database");
    const dbHealthy = await DatabaseConnection.healthCheck();

    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealthy ? "connected" : "disconnected",
      environment: env.NODE_ENV,
      version: process.env.npm_package_version || "1.0.0",
    };

    res.status(dbHealthy ? 200 : 503).json(health);
  } catch (error) {
    logger.error("Health check failed", { error });
    res.status(503).json({
      status: "error",
      timestamp: new Date().toISOString(),
      message: "Service unavailable",
    });
  }
});

// API documentation (only in development)
if (isDevelopment) {
  const swaggerDocument = {
    openapi: "3.0.0",
    info: {
      title: "Job Application Tracker API",
      version: "1.0.0",
      description:
        "API for managing job applications and tracking their progress",
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: "Development server",
      },
    ],
  };

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// API routes will be added here
app.use("/api/v1", (req, res) => {
  res.json({
    message:
      "Job Tracker API v1 - Routes will be implemented in subsequent tasks",
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
