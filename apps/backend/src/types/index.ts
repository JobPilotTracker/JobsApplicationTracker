// Core type definitions for the application

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ErrorDetails;
  message?: string;
}

export interface ErrorDetails {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// User roles enum
export enum UserRole {
  ADMIN = "admin",
  MODERATOR = "moderator",
  USER = "user",
}

// Application status enum
export enum ApplicationStatus {
  NOT_APPLIED = "Not Applied",
  APPLIED = "Applied",
  IN_PROCESS = "In-Process",
  INTERVIEW = "Interview",
  TECHNICAL_INTERVIEW = "Technical Interview",
  FINAL_INTERVIEW = "Final Interview",
  REJECTED = "Rejected",
  OFFER = "Offer",
}

// Employment type enum
export enum EmploymentType {
  FREELANCE = "Freelance",
  FIXED_CONTRACT = "Fixed Contract",
  FULL_TIME = "Full-Time",
  PART_TIME = "Part-Time",
}

// Seniority level enum
export enum SeniorityLevel {
  JUNIOR = "Junior",
  MID = "Mid",
  SENIOR = "Senior",
  MANAGEMENT = "Management",
  CONSULTANT = "Consultant",
}

// Remote type enum
export enum RemoteType {
  ON_SITE = "On-Site",
  REMOTE = "Remote",
  HYBRID = "Hybrid",
}
