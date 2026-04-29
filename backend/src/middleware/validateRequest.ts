import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, type ZodType } from 'zod';

import { AppError, type ValidationErrorDetail } from '../errors/AppError.js';

interface ValidationSchemas {
  body?: ZodType<unknown>;
  query?: ZodType<unknown>;
  params?: ZodType<unknown>;
}

type RequestPart = keyof ValidationSchemas;

const assignParsedRequestPart = (request: Request, part: RequestPart, value: unknown): void => {
  Object.defineProperty(request, part, {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  });
};

const formatZodError = (part: RequestPart, error: ZodError): ValidationErrorDetail[] => {
  return error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join('.') : part,
    message: issue.message,
  }));
};

export const validateRequest =
  (schemas: ValidationSchemas): RequestHandler =>
  (request: Request, _response: Response, next: NextFunction): void => {
    const validationErrors: ValidationErrorDetail[] = [];

    if (schemas.body) {
      const result = schemas.body.safeParse(request.body);

      if (result.success) {
        assignParsedRequestPart(request, 'body', result.data);
      } else {
        validationErrors.push(...formatZodError('body', result.error));
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(request.query);

      if (result.success) {
        assignParsedRequestPart(request, 'query', result.data);
      } else {
        validationErrors.push(...formatZodError('query', result.error));
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(request.params);

      if (result.success) {
        assignParsedRequestPart(request, 'params', result.data);
      } else {
        validationErrors.push(...formatZodError('params', result.error));
      }
    }

    if (validationErrors.length > 0) {
      next(AppError.validation(validationErrors));
      return;
    }

    next();
  };
