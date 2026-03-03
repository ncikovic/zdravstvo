import { Router } from 'express';
import type { HealthStatusDto } from '@zdravstvo/contracts';

import { AppError } from '../errors/AppError.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const healthRouter = Router();

healthRouter.get(
  '/health',
  asyncHandler(async (request, response) => {
    const failureMode = request.query.fail;

    if (failureMode === 'validation') {
      throw AppError.badRequest(
        'VALIDATION_ERROR',
        'The health check request is invalid.'
      );
    }

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
