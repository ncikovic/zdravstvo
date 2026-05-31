import type { Request, Response } from 'express';
import { notificationListQuerySchema } from '@zdravstvo/contracts';

import { AppError } from '../errors/AppError.js';
import { notificationsService } from '../services/index.js';
import { requireAuthenticatedUser } from '../shared/context/index.js';

export const notificationsController = {
  async list(request: Request, response: Response): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const query = notificationListQuerySchema.parse(request.query);
    const result = await notificationsService.list(context, query);

    response.status(200).json(result);
  },

  async unreadCount(request: Request, response: Response): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const result = await notificationsService.unreadCount(context);

    response.status(200).json(result);
  },

  async markRead(request: Request, response: Response): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const notificationId = request.params.notificationId;

    if (!notificationId || Array.isArray(notificationId)) {
      throw AppError.badRequest(
        "NOTIFICATION_ID_REQUIRED",
        "Notification id is required.",
      );
    }

    await notificationsService.markRead(context, notificationId);

    response.status(204).send();
  },

  async markAllRead(request: Request, response: Response): Promise<void> {
    const context = requireAuthenticatedUser(request);
    await notificationsService.markAllRead(context);

    response.status(204).send();
  },
};
