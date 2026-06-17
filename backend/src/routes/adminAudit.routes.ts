import { Router } from 'express';

import { adminAuditController } from '../controllers/index.js';
import { authenticateRequest, requireRoles } from '../shared/middleware/index.js';

export const adminAuditRouter = Router();

adminAuditRouter.use(authenticateRequest);
adminAuditRouter.use(requireRoles());

adminAuditRouter.get('/', adminAuditController.listLogs);
adminAuditRouter.get('/:id', adminAuditController.getLog);
