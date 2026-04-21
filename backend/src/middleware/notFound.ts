import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../errors/AppError.js';

export const notFound = (
  request: Request,
  _response: Response,
  next: NextFunction
): void => {
  next(
    AppError.notFound(
      `Route ${request.method} ${request.originalUrl} was not found.`
    )
  );
};
