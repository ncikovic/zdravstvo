import { Router } from 'express';

import { adminUsersController } from '../controllers/index.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticateRequest, requireRoles } from '../shared/middleware/index.js';
import {
  adminOrgUserIdValidationSchemas,
  listAdminUsersValidationSchemas,
  updateAdminUserValidationSchemas,
} from '../validations/index.js';

export const adminUsersRouter = Router();

adminUsersRouter.use(authenticateRequest, requireRoles());

adminUsersRouter.get(
  '/',
  validateRequest(listAdminUsersValidationSchemas),
  asyncHandler(async (request, response) => {
    await adminUsersController.list(request, response);
  }),
);

adminUsersRouter.get(
  '/:orgUserId',
  validateRequest(adminOrgUserIdValidationSchemas),
  asyncHandler(async (request, response) => {
    await adminUsersController.getById(request, response);
  }),
);

adminUsersRouter.patch(
  '/:orgUserId',
  validateRequest(updateAdminUserValidationSchemas),
  asyncHandler(async (request, response) => {
    await adminUsersController.update(request, response);
  }),
);

adminUsersRouter.patch(
  '/:orgUserId/activate',
  validateRequest(adminOrgUserIdValidationSchemas),
  asyncHandler(async (request, response) => {
    await adminUsersController.activate(request, response);
  }),
);

adminUsersRouter.patch(
  '/:orgUserId/deactivate',
  validateRequest(adminOrgUserIdValidationSchemas),
  asyncHandler(async (request, response) => {
    await adminUsersController.deactivate(request, response);
  }),
);
