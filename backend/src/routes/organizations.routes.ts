import { OrganizationUserRole } from '@zdravstvo/contracts';
import { Router } from 'express';

import { organizationsController } from '../controllers/index.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  authenticateRequest,
  requireRoles,
} from '../shared/middleware/index.js';
import {
  createOrganizationValidationSchemas,
  deleteOrganizationValidationSchemas,
  listOrganizationsValidationSchemas,
  organizationIdValidationSchemas,
  updateOrganizationValidationSchemas,
} from '../validations/index.js';

// Only SYSTEM_ADMIN can create, delete, or list all organizations (requireRoles() with
// no args allows isSystemAdmin=true and denies all org-scoped roles).
// Managers read/update only their own organization via GET/PATCH /organizations/:id.
const systemAdminOnly = requireRoles();
const canReadOrUpdateOrganization = requireRoles(OrganizationUserRole.MANAGER);

export const organizationsRouter = Router();

organizationsRouter.post(
  '/organizations',
  authenticateRequest,
  systemAdminOnly,
  validateRequest(createOrganizationValidationSchemas),
  asyncHandler(async (request, response) => {
    await organizationsController.create(request, response);
  }),
);

organizationsRouter.get(
  '/organizations',
  authenticateRequest,
  systemAdminOnly,
  asyncHandler(async (request, response) => {
    await organizationsController.list(request, response);
  }),
);

organizationsRouter.get(
  '/organizations/public',
  validateRequest(listOrganizationsValidationSchemas),
  asyncHandler(async (request, response) => {
    await organizationsController.listPublic(request, response);
  }),
);

organizationsRouter.get(
  '/organizations/:id',
  authenticateRequest,
  canReadOrUpdateOrganization,
  validateRequest(organizationIdValidationSchemas),
  asyncHandler(async (request, response) => {
    await organizationsController.getById(request, response);
  }),
);

organizationsRouter.patch(
  '/organizations/:id',
  authenticateRequest,
  canReadOrUpdateOrganization,
  validateRequest(updateOrganizationValidationSchemas),
  asyncHandler(async (request, response) => {
    await organizationsController.update(request, response);
  }),
);

organizationsRouter.delete(
  '/organizations/:id',
  authenticateRequest,
  systemAdminOnly,
  validateRequest(deleteOrganizationValidationSchemas),
  asyncHandler(async (request, response) => {
    await organizationsController.delete(request, response);
  }),
);
