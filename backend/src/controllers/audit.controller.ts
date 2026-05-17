import type { Request, Response } from 'express';
import { auditListQuerySchema } from '@zdravstvo/contracts';

import { auditService } from '../services/index.js';
import { requireAuthenticatedUser } from '../shared/context/index.js';
import { idParamsSchema } from '../validations/index.js';

export const auditController = {
  async listLogs(request: Request, response: Response): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const query = auditListQuerySchema.parse(request.query);
    const result = await auditService.listLogs(context, query);

    response.status(200).json(result);
  },

  async getLog(request: Request, response: Response): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const { id } = idParamsSchema.parse(request.params);
    const log = await auditService.getLog(id, context);

    response.status(200).json(log);
  },
};
