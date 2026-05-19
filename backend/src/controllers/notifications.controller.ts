import type { Request, Response } from 'express';
import { notificationListQuerySchema } from '@zdravstvo/contracts';

import { notificationsService } from '../services/index.js';
import { requireAuthenticatedUser } from '../shared/context/index.js';

export const notificationsController = {
  async list(request: Request, response: Response): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const query = notificationListQuerySchema.parse(request.query);
    const result = await notificationsService.list(context, query);

    response.status(200).json(result);
  },
};
