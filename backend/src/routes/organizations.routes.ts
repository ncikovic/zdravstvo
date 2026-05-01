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

const canManageOrganizations = requireRoles(OrganizationUserRole.ADMIN);

export const organizationsRouter = Router();

organizationsRouter.post(
  '/organizations',
  authenticateRequest,
  canManageOrganizations,
  validateRequest(createOrganizationValidationSchemas),
  asyncHandler(async (request, response) => {
    await organizationsController.create(request, response);
  }),
);

organizationsRouter.get(
  '/organizations',
  authenticateRequest,
  canManageOrganizations,
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
  canManageOrganizations,
  validateRequest(organizationIdValidationSchemas),
  asyncHandler(async (request, response) => {
    await organizationsController.getById(request, response);
  }),
);

organizationsRouter.patch(
  '/organizations/:id',
  authenticateRequest,
  canManageOrganizations,
  validateRequest(updateOrganizationValidationSchemas),
  asyncHandler(async (request, response) => {
    await organizationsController.update(request, response);
  }),
);

organizationsRouter.delete(
  '/organizations/:id',
  authenticateRequest,
  canManageOrganizations,
  validateRequest(deleteOrganizationValidationSchemas),
  asyncHandler(async (request, response) => {
    await organizationsController.delete(request, response);
  }),
);
