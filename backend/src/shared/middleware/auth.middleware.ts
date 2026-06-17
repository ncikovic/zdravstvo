import { UserStatus } from '@zdravstvo/contracts';
import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

import { AppError } from '../../errors/AppError.js';
import { UsersRepository } from '../../repositories/index.js';
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

type RequestWithAuth = Parameters<RequestHandler>[0] & {
  auth?: AuthenticatedRequestContext;
};

export const authenticateRequest: RequestHandler = async (
  request,
  _response,
  next,
): Promise<void> => {
  try {
    const token = extractBearerToken(request.header('authorization'));
    const claims = verifyAccessToken(token);

    if (claims.isSystemAdmin) {
      const usersRepository = new UsersRepository(db);
      const user = await usersRepository.findById(claims.sub);

      if (!user || user.status !== UserStatus.ACTIVE || !user.isSystemAdmin) {
        throw AppError.unauthorized('Authentication is invalid or no longer active.');
      }

      const authenticatedRequest = request as RequestWithAuth;
      authenticatedRequest.auth = {
        userId: claims.sub,
        isSystemAdmin: true,
        orgUserId: '',
        organizationUserId: '',
        organizationId: '',
        role: null,
        email: user.email,
        phone: user.phone,
        token: {
          issuedAt: claims.iat,
          expiresAt: claims.exp,
        },
      };

      next();
      return;
    }

    // Org-scoped path — look up the organization_users row
    const { AuthRepository } = await import('../../repositories/index.js');
    const repository = new AuthRepository(db);
    const authContext = await repository.findAuthenticatedContext(
      claims.sub,
      claims.organizationId,
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

    if (authContext.organizationUserId !== claims.orgUserId) {
      throw AppError.unauthorized('Authentication is invalid or no longer active.');
    }

    const authenticatedRequest = request as RequestWithAuth;
    authenticatedRequest.auth = {
      userId: authContext.userId,
      isSystemAdmin: false,
      orgUserId: authContext.organizationUserId,
      organizationUserId: authContext.organizationUserId,
      organizationId: authContext.organizationId,
      role: authContext.role,
      email: authContext.email,
      phone: authContext.phone,
      token: {
        issuedAt: claims.iat,
        expiresAt: claims.exp,
      },
    };

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
