import { Router } from 'express';
import {
  healthCheckQuerySchema,
  type HealthCheckQueryDto,
  type HealthStatusDto,
} from '@zdravstvo/contracts';

import { AppError } from '../errors/AppError.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateRequest } from '../middleware/validateRequest.js';

export const healthRouter = Router();

healthRouter.get(
  '/health',
  validateRequest({ query: healthCheckQuerySchema }),
  asyncHandler(async (request, response) => {
    const { fail: failureMode } = request.query as HealthCheckQueryDto;

    if (failureMode === 'conflict') {
      throw AppError.conflict(
        'CONFLICT',
        'The health check is already in progress.'
      );
    }

    if (failureMode === 'error') {
      throw new Error('Simulated unexpected failure');
    }

    const payload: HealthStatusDto = { ok: true };

    response.status(200).json(payload);
  })
);
