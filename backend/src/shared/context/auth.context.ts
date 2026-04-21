import type { OrganizationUserRole } from '@zdravstvo/contracts';
import type { Request } from 'express';

import { AppError } from '../../errors/AppError.js';

export interface AuthTokenMetadata {
  issuedAt?: number;
  expiresAt?: number;
}

export interface AuthenticatedRequestContext {
  userId: string;
  organizationUserId: string;
  organizationId: string;
  role: OrganizationUserRole;
  email: string | null;
  phone: string | null;
  token: AuthTokenMetadata;
}

export const requireAuthenticatedUser = (
  request: Request
): AuthenticatedRequestContext => {
  if (!request.auth) {
    throw AppError.unauthorized();
  }

  return request.auth;
};
