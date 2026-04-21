import { UserStatus } from '@zdravstvo/contracts';
import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

import { AppError } from '../../errors/AppError.js';
import { AuthRepository } from '../../repositories/index.js';
import { db } from '../db/index.js';
import type { AuthenticatedRequestContext } from '../context/index.js';
import { verifyAccessToken } from '../utils/index.js';

const AUTHORIZATION_SCHEME = 'Bearer';
const { JsonWebTokenError, TokenExpiredError } = jwt;

const extractBearerToken = (authorizationHeader: string | undefined): string => {
  if (!authorizationHeader) {
    throw AppError.unauthorized('Authorization token is required.');
  }

  const [scheme, token, ...rest] = authorizationHeader.trim().split(/\s+/);

  if (scheme !== AUTHORIZATION_SCHEME || !token || rest.length > 0) {
    throw AppError.unauthorized('Authorization header must use Bearer token format.');
  }

  return token;
};

const mapAuthContext = (
  context: {
    userId: string;
    organizationUserId: string;
    organizationId: string;
    role: AuthenticatedRequestContext['role'];
    email: string | null;
    phone: string | null;
  },
  token: {
    iat?: number;
    exp?: number;
  }
): AuthenticatedRequestContext => {
  return {
    userId: context.userId,
    organizationUserId: context.organizationUserId,
    organizationId: context.organizationId,
    role: context.role,
    email: context.email,
    phone: context.phone,
    token: {
      issuedAt: token.iat,
      expiresAt: token.exp,
    },
  };
};

export const authenticateRequest: RequestHandler = async (
  request,
  _response,
  next
): Promise<void> => {
  try {
    const token = extractBearerToken(request.header('authorization'));
    const claims = verifyAccessToken(token);
    const repository = new AuthRepository(db);
    const authContext = await repository.findAuthenticatedContext(
      claims.sub,
      claims.organizationId
    );

    if (!authContext || !authContext.isActive) {
      throw AppError.unauthorized('Authentication is invalid or no longer active.');
    }

    if (authContext.status !== UserStatus.ACTIVE) {
      throw AppError.unauthorized('Authentication is invalid or no longer active.');
    }

    if (authContext.role !== claims.role) {
      throw AppError.unauthorized('Authentication is invalid or no longer active.');
    }

    request.auth = mapAuthContext(authContext, {
      iat: claims.iat,
      exp: claims.exp,
    });

    next();
  } catch (error: unknown) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    if (error instanceof TokenExpiredError) {
      next(AppError.unauthorized('Authentication token has expired.'));
      return;
    }

    if (error instanceof JsonWebTokenError) {
      next(AppError.unauthorized('Authentication token is invalid.'));
      return;
    }

    next(error);
  }
};
