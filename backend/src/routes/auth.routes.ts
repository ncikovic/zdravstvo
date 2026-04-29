import { Router } from 'express';

import { authController } from '../controllers/index.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  loginValidationSchemas,
  registerValidationSchemas,
  selectOrganizationValidationSchemas,
} from '../validations/index.js';

export const authRouter = Router();

authRouter.post(
  '/auth/login',
  validateRequest(loginValidationSchemas),
  asyncHandler(async (request, response) => {
    await authController.login(request, response);
  })
);

authRouter.post(
  '/auth/register',
  validateRequest(registerValidationSchemas),
  asyncHandler(async (request, response) => {
    await authController.register(request, response);
  })
);

authRouter.post(
  '/auth/select-organization',
  validateRequest(selectOrganizationValidationSchemas),
  asyncHandler(async (request, response) => {
    await authController.selectOrganization(request, response);
  })
);
