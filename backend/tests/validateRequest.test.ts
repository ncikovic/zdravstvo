import assert from 'node:assert/strict';
import test from 'node:test';

import type { Request, Response } from 'express';
import { z } from 'zod';

import { AppError } from '../src/errors/AppError.js';
import { validateRequest } from '../src/middleware/validateRequest.js';

const createRequestWithReadonlyQuery = (query: unknown): Request => {
  const request = {} as Request;

  Object.defineProperty(request, 'query', {
    get: () => query,
    enumerable: true,
    configurable: true,
  });

  return request;
};

test('validates readonly query objects without throwing', () => {
  const request = createRequestWithReadonlyQuery({ fail: 'conflict' });
  const middleware = validateRequest({
    query: z.object({
      fail: z.enum(['conflict', 'error']).optional(),
    }),
  });
  let nextError: unknown;

  middleware(request, {} as Response, (error?: unknown) => {
    nextError = error;
  });

  assert.equal(nextError, undefined);
  assert.deepEqual(request.query, { fail: 'conflict' });
});

test('returns validation errors for invalid query values', () => {
  const request = createRequestWithReadonlyQuery({ fail: 'invalid' });
  const middleware = validateRequest({
    query: z.object({
      fail: z.enum(['conflict', 'error']).optional(),
    }),
  });
  let nextError: unknown;

  middleware(request, {} as Response, (error?: unknown) => {
    nextError = error;
  });

  assert(nextError instanceof AppError);
  assert.equal(nextError.code, 'VALIDATION_ERROR');
});
