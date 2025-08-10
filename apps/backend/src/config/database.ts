import { PrismaClient } from "../generated/prisma";
import { logger } from "./logger";

class DatabaseConnection {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new PrismaClient({
        log: [
          { emit: "event", level: "query" },
          { emit: "event", level: "error" },
          { emit: "event", level: "info" },
          { emit: "event", level: "warn" },
        ],
      });

      // Log database queries in development
      if (process.env.NODE_ENV === "development") {
        DatabaseConnection.instance.$on("query", (e) => {
          logger.debug("Database Query", {
            query: e.query,
            params: e.params,
            duration: e.duration,
          });
        });
      }

      // Log database errors
      DatabaseConnection.instance.$on("error", (e) => {
        logger.error("Database Error", { error: e });
      });

      logger.info("Database connection initialized");
    }

    return DatabaseConnection.instance;
  }

  public static async connect(): Promise<void> {
    try {
      const prisma = DatabaseConnection.getInstance();
      await prisma.$connect();
      logger.info("Database connected successfully");
    } catch (error) {
      logger.error("Failed to connect to database", { error });
      throw error;
    }
  }

  public static async disconnect(): Promise<void> {
    try {
      const prisma = DatabaseConnection.getInstance();
      await prisma.$disconnect();
      logger.info("Database disconnected successfully");
    } catch (error) {
      logger.error("Failed to disconnect from database", { error });
      throw error;
    }
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      const prisma = DatabaseConnection.getInstance();
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error("Database health check failed", { error });
      return false;
    }
  }
}

export const prisma = DatabaseConnection.getInstance();
export { DatabaseConnection };
