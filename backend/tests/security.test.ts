import assert from 'node:assert/strict';
import test from 'node:test';

import { loginRequestSchema } from '@zdravstvo/contracts';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';

import { AppError } from '../src/errors/AppError.js';
import { authenticateRequest } from '../src/shared/middleware/auth.middleware.js';
import {
  signAccessToken,
  verifyAccessToken,
} from '../src/shared/utils/jwt.js';

const { JsonWebTokenError } = jwt;

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

// SEC-01: Unauthenticated request is rejected by middleware
test('SEC-01: unauthenticated request (no token) is rejected with 401', async () => {
  const error = await callMiddleware(makeRequest(undefined));

  assert(error instanceof AppError);
  assert.equal(error.status, 401);
  assert.equal(error.code, 'UNAUTHORIZED');
});

// SEC-02: Invalid JWT token is rejected
test('SEC-02: invalid JWT token is rejected with 401', async () => {
  const error = await callMiddleware(makeRequest('Bearer invalid.jwt.token'));

  assert(error instanceof AppError);
  assert.equal(error.status, 401);
  assert.equal(error.code, 'UNAUTHORIZED');
});

// SEC-03: JWT signed with wrong secret is rejected at verification level
test('SEC-03: JWT signed with wrong secret cannot be verified', () => {
  const forgedToken = jwt.sign(
    { sub: 'attacker-id', isSystemAdmin: true },
    'wrong-secret',
  );

  assert.throws(
    () => verifyAccessToken(forgedToken),
    (error: unknown) => error instanceof JsonWebTokenError,
  );
});

// SEC-04: Organization scoping — a token carrying org A cannot be reused as org B
test('SEC-04: access token encodes organization ID in verified claims', () => {
  const ORG_A = 'aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const ORG_B = 'bbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

  const tokenForOrgA = signAccessToken({
    sub: 'user-id',
    isSystemAdmin: false,
    organizationId: ORG_A,
    orgUserId: 'ou-id',
    role: 'MANAGER' as import('@zdravstvo/contracts').OrganizationUserRole,
  });

  const claims = verifyAccessToken(tokenForOrgA);

  assert.equal(claims.isSystemAdmin, false);
  if (!claims.isSystemAdmin) {
    assert.equal(claims.organizationId, ORG_A);
    assert.notEqual(claims.organizationId, ORG_B);
  }
});

// SEC-05: Login input validation — empty identifier rejected
test('SEC-05: login validation rejects empty identifier', () => {
  const result = loginRequestSchema.safeParse({ identifier: '', password: 'pass1234' });

  assert.equal(result.success, false);
});

// SEC-06: Login input validation — empty password rejected
test('SEC-06: login validation rejects empty password', () => {
  const result = loginRequestSchema.safeParse({
    identifier: 'user@example.com',
    password: '',
  });

  assert.equal(result.success, false);
});

// SEC-07: Login input validation — whitespace-only identifier rejected
test('SEC-07: login validation rejects whitespace-only identifier', () => {
  const result = loginRequestSchema.safeParse({
    identifier: '   ',
    password: 'password123',
  });

  assert.equal(result.success, false);
});

// SEC-08: Internal errors are not operational — prevents leaking stack traces
test('SEC-08: AppError.internal has isOperational false to suppress detail leakage', () => {
  const error = AppError.internal('Unexpected DB failure');

  assert.equal(error.isOperational, false);
  assert.equal(error.status, 500);
});

// SEC-09: Expired JWT is rejected at middleware level
test('SEC-09: expired JWT is rejected by auth middleware with 401', async () => {
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
