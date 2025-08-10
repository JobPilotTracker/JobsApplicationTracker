import { env } from "./config/environment";
import { logger } from "./config/logger";
import { DatabaseConnection } from "./config/database";
import app from "./app";

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown`);

  try {
    // Close database connection
    await DatabaseConnection.disconnect();
    logger.info("Database connection closed");

    // Exit process
    process.exit(0);
  } catch (error) {
    logger.error("Error during graceful shutdown", { error });
    process.exit(1);
  }
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", { error });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { reason, promise });
  process.exit(1);
});

// Start the server
const startServer = async () => {
  try {
    // Connect to database
    await DatabaseConnection.connect();

    // Start HTTP server
    const server = app.listen(env.PORT, () => {
      logger.info(`Server started successfully`, {
        port: env.PORT,
        environment: env.NODE_ENV,
        nodeVersion: process.version,
      });
    });

    // Handle server errors
    server.on("error", (error) => {
      logger.error("Server error", { error });
      process.exit(1);
    });
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
};

// Start the application
startServer();
