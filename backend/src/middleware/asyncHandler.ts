import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncRouteHandler = (
  request: Request,
  response: Response,
  next: NextFunction
) => Promise<unknown>;

export const asyncHandler = (fn: AsyncRouteHandler): RequestHandler => {
  return (request, response, next) => {
    Promise.resolve(fn(request, response, next)).catch(next);
  };
};
