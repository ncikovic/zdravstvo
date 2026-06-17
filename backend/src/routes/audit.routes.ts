import { Router } from 'express';

import { auditController } from '../controllers/index.js';
import { authenticateRequest } from '../shared/middleware/index.js';
import { requireRoles } from '../shared/middleware/index.js';
import { OrganizationUserRole } from '@zdravstvo/contracts';

export const auditRouter = Router();

auditRouter.use(authenticateRequest);
auditRouter.use(requireRoles(OrganizationUserRole.MANAGER));

auditRouter.get('/', auditController.listLogs);
auditRouter.get('/:id', auditController.getLog);
