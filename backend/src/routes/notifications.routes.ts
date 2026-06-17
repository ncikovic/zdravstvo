import { Router } from 'express';
import { OrganizationUserRole } from '@zdravstvo/contracts';

import { notificationsController } from '../controllers/index.js';
import { authenticateRequest, requireRoles } from '../shared/middleware/index.js';

export const notificationsRouter = Router();

notificationsRouter.use(authenticateRequest);
notificationsRouter.use(
  requireRoles(
    OrganizationUserRole.MANAGER,
    OrganizationUserRole.RECEPTION,
    OrganizationUserRole.DOCTOR,
    OrganizationUserRole.PATIENT,
  ),
);

notificationsRouter.get('/', notificationsController.list);
notificationsRouter.get('/unread-count', notificationsController.unreadCount);
notificationsRouter.patch('/read-all', notificationsController.markAllRead);
notificationsRouter.patch('/:notificationId/read', notificationsController.markRead);
