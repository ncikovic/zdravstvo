import type { NextFunction, Request, Response } from 'express';

export const notFound = (
  _request: Request,
  response: Response,
  next: NextFunction
): void => {
  if (response.headersSent) {
    next();
    return;
  }

  response.status(404).json({
    message: 'Route not found',
  });
};
