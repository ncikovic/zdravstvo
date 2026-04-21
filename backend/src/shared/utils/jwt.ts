import { OrganizationUserRole } from '@zdravstvo/contracts';
import jwt, {
  JsonWebTokenError,
  type JwtPayload,
  type SignOptions,
  TokenExpiredError,
} from 'jsonwebtoken';

import { env } from '../../config/env.js';

export interface AccessTokenClaims {
  sub: string;
  organizationId: string;
  role: OrganizationUserRole;
}

export interface VerifiedAccessTokenClaims extends AccessTokenClaims {
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

export const verifyAccessToken = (token: string): VerifiedAccessTokenClaims => {
  try {
    const payload = jwt.verify(token, env.jwtSecret);

    if (!isJwtPayload(payload)) {
      throw new JsonWebTokenError('Invalid token payload.');
    }

    const { sub, organizationId, role, iat, exp } = payload;

    if (
      typeof sub !== 'string' ||
      typeof organizationId !== 'string' ||
      !isOrganizationUserRole(role)
    ) {
      throw new JsonWebTokenError('Invalid token payload.');
    }

    return {
      sub,
      organizationId,
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
