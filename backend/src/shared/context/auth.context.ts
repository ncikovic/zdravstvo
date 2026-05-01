import type { OrganizationUserRole } from '@zdravstvo/contracts';
import type { Request } from 'express';

import { AppError } from '../../errors/AppError.js';

export interface AuthTokenMetadata {
  issuedAt?: number;
  expiresAt?: number;
}

export interface AuthenticatedRequestContext {
  userId: string;
  orgUserId: string;
  organizationUserId: string;
  organizationId: string;
  role: OrganizationUserRole;
  email: string | null;
  phone: string | null;
  token: AuthTokenMetadata;
}

type RequestWithAuth = Request & {
  auth?: AuthenticatedRequestContext;
};

export const requireAuthenticatedUser = (
  request: Request
): AuthenticatedRequestContext => {
  const authenticatedRequest = request as RequestWithAuth;

  if (!authenticatedRequest.auth) {
    throw AppError.unauthorized();
  }

  return authenticatedRequest.auth;
};
