import assert from 'node:assert/strict';
import test from 'node:test';

import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';

import { AppError } from '../src/errors/AppError.js';
import { authenticateRequest } from '../src/shared/middleware/auth.middleware.js';

const makeRequest = (authorizationHeader?: string): Request =>
  ({
    header: (name: string) =>
      name.toLowerCase() === 'authorization' ? authorizationHeader : undefined,
  }) as unknown as Request;

const callMiddleware = (request: Request): Promise<unknown> =>
  new Promise((resolve) => {
    authenticateRequest(request, {} as Response, (error?: unknown) => {
      resolve(error);
    });
  });

test('rejects request with no Authorization header with 401', async () => {
  const error = await callMiddleware(makeRequest(undefined));

  assert(error instanceof AppError);
  assert.equal(error.status, 401);
  assert.equal(error.code, 'UNAUTHORIZED');
});

test('rejects request with wrong Authorization scheme (Basic) with 401', async () => {
  const error = await callMiddleware(makeRequest('Basic dXNlcjpwYXNz'));

  assert(error instanceof AppError);
  assert.equal(error.status, 401);
  assert.equal(error.code, 'UNAUTHORIZED');
});

test('rejects request with Bearer scheme but no token with 401', async () => {
  const error = await callMiddleware(makeRequest('Bearer'));

  assert(error instanceof AppError);
  assert.equal(error.status, 401);
});

test('rejects request with multiple tokens after Bearer with 401', async () => {
  const error = await callMiddleware(makeRequest('Bearer token1 token2'));

  assert(error instanceof AppError);
  assert.equal(error.status, 401);
});

test('rejects request with a non-JWT Bearer token with 401', async () => {
  const error = await callMiddleware(makeRequest('Bearer this-is-not-a-jwt'));

  assert(error instanceof AppError);
  assert.equal(error.status, 401);
  assert.equal(error.code, 'UNAUTHORIZED');
});

test('rejects request with an expired JWT with 401', async () => {
  const expiredToken = jwt.sign(
    { sub: 'user-id', isSystemAdmin: true },
    'zdravstvo-dev-secret',
    { expiresIn: -1 },
  );

  const error = await callMiddleware(makeRequest(`Bearer ${expiredToken}`));

  assert(error instanceof AppError);
  assert.equal(error.status, 401);
  assert.equal(error.code, 'UNAUTHORIZED');
});

test('rejects request with a JWT signed with the wrong secret with 401', async () => {
  const wrongSecretToken = jwt.sign(
    { sub: 'user-id', isSystemAdmin: true },
    'wrong-secret-key',
  );

  const error = await callMiddleware(makeRequest(`Bearer ${wrongSecretToken}`));

  assert(error instanceof AppError);
  assert.equal(error.status, 401);
  assert.equal(error.code, 'UNAUTHORIZED');
});
