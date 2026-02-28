import { Router } from 'express';
import type { HealthStatusDto } from '@zdravstvo/contracts';

export const healthRouter = Router();

healthRouter.get('/health', (_request, response) => {
  const payload: HealthStatusDto = { ok: true };

  response.status(200).json(payload);
});
