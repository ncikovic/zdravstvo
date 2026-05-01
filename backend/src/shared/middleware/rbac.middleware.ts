import type { OrganizationUserRole } from '@zdravstvo/contracts';
import type { Request, RequestHandler } from 'express';

import { AppError } from '../../errors/AppError.js';
import type { AuthenticatedRequestContext } from '../context/index.js';

type RequestWithAuth = Request & {
  auth?: Partial<AuthenticatedRequestContext>;
};

export const requireRoles =
  (...allowedRoles: readonly OrganizationUserRole[]): RequestHandler =>
  (request, _response, next): void => {
    try {
      const { role } = (request as RequestWithAuth).auth ?? {};

      if (!role || !allowedRoles.includes(role)) {
        throw AppError.forbidden();
      }

      next();
    } catch (error: unknown) {
      next(error);
    }
  };

export const authorizeRoles = requireRoles;
