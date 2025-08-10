import { Response } from "express";
import { ApiResponse, PaginatedResponse } from "../types";
import { AppError, createErrorDetails } from "./errors";

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  error: AppError,
  requestId: string
): Response => {
  const response: ApiResponse = {
    success: false,
    error: createErrorDetails(error, requestId),
  };
  return res.status(error.statusCode).json(response);
};

export const sendPaginatedResponse = <T>(
  res: Response,
  data: T[],
  pagination: PaginatedResponse<T>["pagination"],
  message?: string
): Response => {
  const response: ApiResponse<PaginatedResponse<T>> = {
    success: true,
    data: {
      data,
      pagination,
    },
    message,
  };
  return res.status(200).json(response);
};
