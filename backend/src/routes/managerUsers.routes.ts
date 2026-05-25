import { OrganizationUserRole } from '@zdravstvo/contracts';
import { Router } from 'express';

import { managerUsersController } from '../controllers/index.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticateRequest, requireRoles } from '../shared/middleware/index.js';
import {
  createManagerUserValidationSchemas,
  listManagerUsersValidationSchemas,
  managerOrgUserIdValidationSchemas,
  updateManagerUserValidationSchemas,
} from '../validations/index.js';

export const managerUsersRouter = Router();

managerUsersRouter.use(authenticateRequest, requireRoles(OrganizationUserRole.MANAGER));

managerUsersRouter.get(
  '/',
  validateRequest(listManagerUsersValidationSchemas),
  asyncHandler(async (request, response) => {
    await managerUsersController.list(request, response);
  }),
);

managerUsersRouter.post(
  '/',
  validateRequest(createManagerUserValidationSchemas),
  asyncHandler(async (request, response) => {
    await managerUsersController.create(request, response);
  }),
);

managerUsersRouter.get(
  '/:orgUserId',
  validateRequest(managerOrgUserIdValidationSchemas),
  asyncHandler(async (request, response) => {
    await managerUsersController.getById(request, response);
  }),
);

managerUsersRouter.patch(
  '/:orgUserId',
  validateRequest(updateManagerUserValidationSchemas),
  asyncHandler(async (request, response) => {
    await managerUsersController.update(request, response);
  }),
);

managerUsersRouter.patch(
  '/:orgUserId/activate',
  validateRequest(managerOrgUserIdValidationSchemas),
  asyncHandler(async (request, response) => {
    await managerUsersController.activate(request, response);
  }),
);

managerUsersRouter.patch(
  '/:orgUserId/deactivate',
  validateRequest(managerOrgUserIdValidationSchemas),
  asyncHandler(async (request, response) => {
    await managerUsersController.deactivate(request, response);
  }),
);
