import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../errors/index.js';

export const errorHandler = (
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction
): void => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      message: error.message,
      code: error.code,
      details: error.details,
    });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      message: 'Invalid request payload.',
      code: 'VALIDATION_ERROR',
      details: error.issues,
    });
    return;
  }
  
  console.error(error);
  response.status(500).json({
    message: 'Unexpected server error',
    code: 'INTERNAL_ERROR',
  });
};
