import { Router } from 'express';

import { appointmentTypesRouter } from './appointmentTypes.routes.js';
import { healthRouter } from './health.routes.js';
import { patientsRouter } from './patients.routes.js';

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use('/patients', patientsRouter);
apiRouter.use('/appointment-types', appointmentTypesRouter);
