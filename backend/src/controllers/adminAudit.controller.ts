import type { Request, Response } from 'express';
import { auditListQuerySchema } from '@zdravstvo/contracts';

import { adminAuditService } from '../services/index.js';
import { idParamsSchema } from '../validations/index.js';

export const adminAuditController = {
  async listLogs(request: Request, response: Response): Promise<void> {
    const query = auditListQuerySchema.parse(request.query);
    const result = await adminAuditService.listAllLogs(query);

    response.status(200).json(result);
  },

  async getLog(request: Request, response: Response): Promise<void> {
    const { id } = idParamsSchema.parse(request.params);
    const log = await adminAuditService.getLog(id);

    response.status(200).json(log);
  },
};
