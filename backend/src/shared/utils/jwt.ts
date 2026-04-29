import { OrganizationUserRole } from '@zdravstvo/contracts';
import jwt from 'jsonwebtoken';
import type { JwtPayload, SignOptions } from 'jsonwebtoken';

import { env } from '../../config/env.js';

const { JsonWebTokenError, TokenExpiredError } = jwt;

export interface AccessTokenClaims {
  sub: string;
  organizationId: string;
  orgUserId: string;
  role: OrganizationUserRole;
}

export interface VerifiedAccessTokenClaims extends AccessTokenClaims {
  iat?: number;
  exp?: number;
}

export interface OrganizationSelectionTokenClaims {
  sub: string;
  purpose: 'organization_selection';
}

export interface VerifiedOrganizationSelectionTokenClaims
  extends OrganizationSelectionTokenClaims {
  iat?: number;
  exp?: number;
}

const isJwtPayload = (value: string | JwtPayload): value is JwtPayload => {
  return typeof value !== 'string';
};

const isOrganizationUserRole = (value: unknown): value is OrganizationUserRole => {
  return Object.values(OrganizationUserRole).includes(
    value as OrganizationUserRole
  );
};

export const signAccessToken = (claims: AccessTokenClaims): string => {
  const options: SignOptions = {
    expiresIn: env.jwtAccessTokenExpiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(claims, env.jwtSecret, options);
};

export const signOrganizationSelectionToken = (
  claims: Omit<OrganizationSelectionTokenClaims, 'purpose'>
): string => {
  const options: SignOptions = {
    expiresIn: '10m',
  };

  return jwt.sign(
    {
      ...claims,
      purpose: 'organization_selection',
    },
    env.jwtSecret,
    options
  );
};

export const verifyAccessToken = (token: string): VerifiedAccessTokenClaims => {
  try {
    const payload = jwt.verify(token, env.jwtSecret);

    if (!isJwtPayload(payload)) {
      throw new JsonWebTokenError('Invalid token payload.');
    }

    const { sub, organizationId, orgUserId, role, iat, exp } = payload;

    if (
      typeof sub !== 'string' ||
      typeof organizationId !== 'string' ||
      typeof orgUserId !== 'string' ||
      !isOrganizationUserRole(role)
    ) {
      throw new JsonWebTokenError('Invalid token payload.');
    }

    return {
      sub,
      organizationId,
      orgUserId,
      role,
      iat: typeof iat === 'number' ? iat : undefined,
      exp: typeof exp === 'number' ? exp : undefined,
    };
  } catch (error: unknown) {
    if (
      error instanceof JsonWebTokenError ||
      error instanceof TokenExpiredError
    ) {
      throw error;
    }

    throw new JsonWebTokenError('Invalid token.');
  }
};

export const verifyOrganizationSelectionToken = (
  token: string
): VerifiedOrganizationSelectionTokenClaims => {
  try {
    const payload = jwt.verify(token, env.jwtSecret);

    if (!isJwtPayload(payload)) {
      throw new JsonWebTokenError('Invalid token payload.');
    }

    const { sub, purpose, iat, exp } = payload;

    if (typeof sub !== 'string' || purpose !== 'organization_selection') {
      throw new JsonWebTokenError('Invalid token payload.');
    }

    return {
      sub,
      purpose,
      iat: typeof iat === 'number' ? iat : undefined,
      exp: typeof exp === 'number' ? exp : undefined,
    };
  } catch (error: unknown) {
    if (
      error instanceof JsonWebTokenError ||
      error instanceof TokenExpiredError
    ) {
      throw error;
    }

    throw new JsonWebTokenError('Invalid token.');
  }
};
