import { Router } from 'express';

import { authController } from '../controllers/index.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { registerValidationSchemas } from '../validations/index.js';

export const authRouter = Router();

authRouter.post(
  '/auth/register',
  validateRequest(registerValidationSchemas),
  asyncHandler(async (request, response) => {
    await authController.register(request, response);
  })
);
