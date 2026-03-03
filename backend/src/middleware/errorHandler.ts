import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../errors/AppError.js';

export const errorHandler = (
  error: unknown,
  request: Request,
  response: Response,
  _next: NextFunction
): void => {
  if (response.headersSent) {
    return;
  }

  if (error instanceof AppError) {
    if (error.code === 'VALIDATION_ERROR' && error.details) {
      response.status(error.status).json({
        success: false,
        message: error.message,
        errors: error.details,
      });
      return;
    }

    response.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  const logMessage = error instanceof Error ? error.name : 'UnknownError';

  console.error('Unhandled error', {
    method: request.method,
    path: request.originalUrl,
    error: logMessage,
  });

  response.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected server error.',
    },
  });
};
