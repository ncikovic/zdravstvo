import { Router } from 'express';
import { OrganizationUserRole } from '@zdravstvo/contracts';

import { notificationsController } from '../controllers/index.js';
import { authenticateRequest, requireRoles } from '../shared/middleware/index.js';

export const notificationsRouter = Router();

notificationsRouter.use(authenticateRequest);
notificationsRouter.use(requireRoles(OrganizationUserRole.MANAGER, OrganizationUserRole.RECEPTION));

notificationsRouter.get('/', notificationsController.list);
