import assert from 'node:assert/strict';
import test from 'node:test';

import { AppError } from '../src/errors/AppError.js';

test('AppError.unauthorized creates 401 error with UNAUTHORIZED code', () => {
  const error = AppError.unauthorized();

  assert(error instanceof AppError);
  assert(error instanceof Error);
  assert.equal(error.status, 401);
  assert.equal(error.code, 'UNAUTHORIZED');
  assert.equal(error.isOperational, true);
  assert.equal(error.name, 'AppError');
});

test('AppError.unauthorized accepts a custom message', () => {
  const error = AppError.unauthorized('Custom auth message');

  assert.equal(error.message, 'Custom auth message');
  assert.equal(error.status, 401);
});

test('AppError.forbidden creates 403 error with FORBIDDEN code', () => {
  const error = AppError.forbidden();

  assert(error instanceof AppError);
  assert.equal(error.status, 403);
  assert.equal(error.code, 'FORBIDDEN');
  assert.equal(error.isOperational, true);
});

test('AppError.notFound creates 404 error with NOT_FOUND code', () => {
  const error = AppError.notFound();

  assert(error instanceof AppError);
  assert.equal(error.status, 404);
  assert.equal(error.code, 'NOT_FOUND');
});

test('AppError.badRequest creates 400 error with the given code', () => {
  const error = AppError.badRequest('BAD_REQUEST', 'Bad input provided');

  assert(error instanceof AppError);
  assert.equal(error.status, 400);
  assert.equal(error.code, 'BAD_REQUEST');
  assert.equal(error.message, 'Bad input provided');
});

test('AppError.conflict creates 409 error with the given code', () => {
  const error = AppError.conflict('EMAIL_ALREADY_EXISTS', 'Email already taken');

  assert(error instanceof AppError);
  assert.equal(error.status, 409);
  assert.equal(error.code, 'EMAIL_ALREADY_EXISTS');
  assert.equal(error.message, 'Email already taken');
});

test('AppError.validation creates 400 error with VALIDATION_ERROR code and details', () => {
  const details = [
    { field: 'email', message: 'Required' },
    { field: 'password', message: 'Too short' },
  ];
  const error = AppError.validation(details);

  assert(error instanceof AppError);
  assert.equal(error.status, 400);
  assert.equal(error.code, 'VALIDATION_ERROR');
  assert.deepEqual(error.details, details);
  assert.equal(error.isOperational, true);
});

test('AppError.internal creates 500 error with isOperational false', () => {
  const error = AppError.internal();

  assert(error instanceof AppError);
  assert.equal(error.status, 500);
  assert.equal(error.code, 'INTERNAL_SERVER_ERROR');
  assert.equal(error.isOperational, false);
});

test('AppError instances pass instanceof Error check', () => {
  const error = AppError.unauthorized();

  assert(error instanceof Error);
  assert.equal(error.name, 'AppError');
});
