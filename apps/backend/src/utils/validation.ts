import { z } from "zod";
import { ValidationError } from "./errors";

// Common validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const idSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

// Validation helper function
export const validateSchema = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Validation failed", error.errors);
    }
    throw error;
  }
};

// Middleware factory for request validation
export const validateRequest = (schema: {
  body?: z.ZodSchema;
  params?: z.ZodSchema;
  query?: z.ZodSchema;
}) => {
  return (req: any, res: any, next: any) => {
    try {
      if (schema.body) {
        req.body = validateSchema(schema.body, req.body);
      }
      if (schema.params) {
        req.params = validateSchema(schema.params, req.params);
      }
      if (schema.query) {
        req.query = validateSchema(schema.query, req.query);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
