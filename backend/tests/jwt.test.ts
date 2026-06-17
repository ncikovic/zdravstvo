import assert from 'node:assert/strict';
import test from 'node:test';

import { OrganizationUserRole } from '@zdravstvo/contracts';
import jwt from 'jsonwebtoken';

import {
  signAccessToken,
  signOrganizationSelectionToken,
  verifyAccessToken,
  verifyOrganizationSelectionToken,
} from '../src/shared/utils/jwt.js';

const { JsonWebTokenError, TokenExpiredError } = jwt;

const SYSTEM_ADMIN_CLAIMS = {
  sub: '11111111-1111-4111-8111-111111111111',
  isSystemAdmin: true as const,
};

const ORG_SCOPED_CLAIMS = {
  sub: '22222222-2222-4222-8222-222222222222',
  isSystemAdmin: false as const,
  organizationId: '33333333-3333-4333-8333-333333333333',
  orgUserId: '44444444-4444-4444-8444-444444444444',
  role: OrganizationUserRole.MANAGER,
};

test('signs and verifies a system admin access token', () => {
  const token = signAccessToken(SYSTEM_ADMIN_CLAIMS);
  const claims = verifyAccessToken(token);

  assert.equal(claims.sub, SYSTEM_ADMIN_CLAIMS.sub);
  assert.equal(claims.isSystemAdmin, true);
  assert(typeof claims.iat === 'number');
  assert(typeof claims.exp === 'number');
});

test('signs and verifies an org-scoped access token', () => {
  const token = signAccessToken(ORG_SCOPED_CLAIMS);
  const claims = verifyAccessToken(token);

  assert.equal(claims.sub, ORG_SCOPED_CLAIMS.sub);
  assert.equal(claims.isSystemAdmin, false);

  if (!claims.isSystemAdmin) {
    assert.equal(claims.organizationId, ORG_SCOPED_CLAIMS.organizationId);
    assert.equal(claims.orgUserId, ORG_SCOPED_CLAIMS.orgUserId);
    assert.equal(claims.role, ORG_SCOPED_CLAIMS.role);
  }
});

test('verifyAccessToken throws JsonWebTokenError for an invalid token string', () => {
  assert.throws(
    () => verifyAccessToken('this-is-not-a-jwt'),
    (error: unknown) => error instanceof JsonWebTokenError,
  );
});

test('verifyAccessToken throws JsonWebTokenError for an empty string', () => {
  assert.throws(
    () => verifyAccessToken(''),
    (error: unknown) => error instanceof JsonWebTokenError,
  );
});

test('verifyAccessToken throws JsonWebTokenError when required claims are missing', () => {
  // Token signed without the sub claim
  const badToken = jwt.sign({ foo: 'bar' }, 'zdravstvo-dev-secret');

  assert.throws(
    () => verifyAccessToken(badToken),
    (error: unknown) => error instanceof JsonWebTokenError,
  );
});

test('verifyAccessToken throws JsonWebTokenError when org-scoped claims are incomplete', () => {
  // Token has isSystemAdmin:false but missing organizationId / role
  const incompleteToken = jwt.sign(
    { sub: 'user-id', isSystemAdmin: false },
    'zdravstvo-dev-secret',
  );

  assert.throws(
    () => verifyAccessToken(incompleteToken),
    (error: unknown) => error instanceof JsonWebTokenError,
  );
});

test('verifyAccessToken throws TokenExpiredError for an expired token', () => {
  const expiredToken = jwt.sign(
    { ...SYSTEM_ADMIN_CLAIMS },
    'zdravstvo-dev-secret',
    { expiresIn: -1 },
  );

  assert.throws(
    () => verifyAccessToken(expiredToken),
    (error: unknown) => error instanceof TokenExpiredError,
  );
});

test('verifyAccessToken throws JsonWebTokenError for a token signed with the wrong secret', () => {
  const wrongSecretToken = jwt.sign(
    { ...SYSTEM_ADMIN_CLAIMS },
    'wrong-secret-key',
  );

  assert.throws(
    () => verifyAccessToken(wrongSecretToken),
    (error: unknown) => error instanceof JsonWebTokenError,
  );
});

test('signs and verifies an organization selection token', () => {
  const token = signOrganizationSelectionToken({ sub: SYSTEM_ADMIN_CLAIMS.sub });
  const claims = verifyOrganizationSelectionToken(token);

  assert.equal(claims.sub, SYSTEM_ADMIN_CLAIMS.sub);
  assert.equal(claims.purpose, 'organization_selection');
});

test('verifyOrganizationSelectionToken rejects an access token used as a selection token', () => {
  const accessToken = signAccessToken(SYSTEM_ADMIN_CLAIMS);

  assert.throws(
    () => verifyOrganizationSelectionToken(accessToken),
    (error: unknown) => error instanceof JsonWebTokenError,
  );
});

test('verifyOrganizationSelectionToken throws JsonWebTokenError for an invalid string', () => {
  assert.throws(
    () => verifyOrganizationSelectionToken('garbage'),
    (error: unknown) => error instanceof JsonWebTokenError,
  );
});
