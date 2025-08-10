import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../utils/errors";

const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route ${req.method} ${req.path} not found`);
  next(error);
};

export default notFound;
